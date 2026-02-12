import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
 * POST /api/stripe/connect/onboard
 * Creates an Account Link for onboarding a connected account
 * 
 * Account Links are short-lived URLs that allow connected accounts
 * to complete their onboarding process through Stripe's hosted UI
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    // Create an Account Link for onboarding
    // This generates a URL where the connected account can complete setup
    const accountLink = await stripe.accountLinks.create({
      // The connected account to onboard
      account: accountId,
      
      // URL to redirect to after successful onboarding
      refresh_url: `${APP_URL}/connect/refresh?accountId=${accountId}`,
      
      // URL to redirect to after user completes onboarding
      return_url: `${APP_URL}/connect/return?accountId=${accountId}`,
      
      // Type of link - account_onboarding for initial setup
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    });
  } catch (error: any) {
    console.error('Stripe Connect onboarding link error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}

