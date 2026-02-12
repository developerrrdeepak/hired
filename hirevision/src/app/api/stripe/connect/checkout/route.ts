import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { stripeRateLimit } from '@/lib/rate-limit';

// PLACEHOLDER: Ensure STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

// PLACEHOLDER: Set your application URL
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hirevisi.vercel.app';

/**
 * POST /api/stripe/connect/checkout
 * Creates a Checkout Session for a connected account's product
 * 
 * Uses Direct Charge with application fee to monetize transactions
 * The connected account receives payment minus platform fee
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await stripeRateLimit(ip);
    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', { ip });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { accountId, priceId, quantity, applicationFeeAmount } = await request.json();
    logger.info('Creating checkout session', { accountId, priceId });

    if (!accountId || !priceId) {
      return NextResponse.json(
        { error: 'accountId and priceId are required' },
        { status: 400 }
      );
    }

    // Calculate application fee (platform's revenue)
    // Default to 10% of transaction if not specified
    // PLACEHOLDER: Adjust fee calculation based on your business model
    const fee = applicationFeeAmount || 0;

    // Create Checkout Session on connected account
    // This uses Direct Charge - payment goes to connected account
    const session = await stripe.checkout.sessions.create(
      {
        // Line items for the checkout
        line_items: [
          {
            // Price ID from the connected account's product
            price: priceId,
            
            // Quantity of items
            quantity: quantity || 1,
          },
        ],
        
        // Payment Intent configuration for Direct Charge
        payment_intent_data: {
          // Application fee - platform's revenue from this transaction
          // This amount goes to the platform account
          // Connected account receives (total - application_fee_amount)
          application_fee_amount: fee,
        },
        
        // Mode: 'payment' for one-time charges
        // Use 'subscription' for recurring payments
        mode: 'payment',
        
        // URL to redirect after successful payment
        success_url: `${APP_URL}/connect/success?session_id={CHECKOUT_SESSION_ID}`,
        
        // URL to redirect if user cancels
        cancel_url: `${APP_URL}/connect/storefront/${accountId}`,
      },
      {
        // IMPORTANT: stripeAccount creates checkout on connected account
        // Payment is processed as a Direct Charge to their account
        stripeAccount: accountId,
      }
    );

    logger.info('Checkout session created', { sessionId: session.id });
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    logger.error('Stripe Connect checkout error', { error: error.message, accountId });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

