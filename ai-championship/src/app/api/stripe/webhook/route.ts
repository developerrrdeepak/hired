import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

/**
 * Stripe Webhook Handler
 * Processes Stripe events with signature verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Webhook received without signature');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      logger.error('Webhook signature verification failed', { error: err.message });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    logger.info('Webhook received', { type: event.type, id: event.id });

    const firestore = getFirestore();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { organizationId } = session.metadata || {};
        
        if (organizationId) {
          await firestore.collection('organizations').doc(organizationId).update({
            lastPayment: new Date().toISOString(),
            paymentStatus: 'paid',
          });
          logger.info('Payment recorded', { organizationId, sessionId: session.id });
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        logger.info('Account updated', { accountId: account.id });
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.error('Payment failed', { paymentIntentId: paymentIntent.id });
        break;
      }

      default:
        logger.debug('Unhandled webhook event', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook processing error', { error: error.message });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
