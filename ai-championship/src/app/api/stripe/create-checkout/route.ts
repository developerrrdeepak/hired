import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/firebase/admin'; // Centralized admin instance

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hirevisi.vercel.app';

// Map internal plan IDs to Stripe Price IDs
const PLAN_TO_PRICE_ID: Record<string, string> = {
  'starter': process.env.STRIPE_PRICE_STARTER || 'price_starter_dummy',
  'pro': process.env.STRIPE_PRICE_PRO || 'price_pro_dummy',
  'enterprise': process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_dummy',
};

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
  }

  try {
    const { planId, priceId: explicitPriceId, organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 });
    }

    const priceId = explicitPriceId || (planId ? PLAN_TO_PRICE_ID[planId] : null);

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or price ID' }, { status: 400 });
    }

    const orgDoc = await adminDb.collection('organizations').doc(organizationId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgData = orgDoc.data();
    let customerId = orgData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: orgData?.email || `org-${organizationId}@hirevision.local`,
        metadata: { organizationId },
      });
      customerId = customer.id;
      await adminDb.collection('organizations').doc(organizationId).update({
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/billing?cancelled=true`,
      metadata: { organizationId, planId: planId || 'custom' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
