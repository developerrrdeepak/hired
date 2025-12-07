import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv } from '@/lib/env';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const APP_URL = getEnv().NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'User required' }, { status: 401 });
    }

    let priceId = '';
    // Map planId to real Stripe Price IDs (use env vars in production)
    switch (planId) {
      case 'starter': priceId = 'price_starter_dummy_id'; break;
      case 'pro': priceId = 'price_pro_dummy_id'; break;
      case 'enterprise': priceId = 'price_ent_dummy_id'; break;
      default: return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // For demo/hackathon without real Stripe account, we mock the success
    if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ 
            url: `${APP_URL}/billing?success=true&plan=${planId}&mock=true` 
        });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing?canceled=true`,
      customer_email: email,
      metadata: {
        userId,
        planId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
