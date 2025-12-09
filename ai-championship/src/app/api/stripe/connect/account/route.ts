import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the latest API version
// PLACEHOLDER: Add your Stripe secret key to environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables. Please add it to your .env.local file.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

/**
 * POST /api/stripe/connect/account
 * Creates a new Stripe Connected Account for an employer
 * 
 * This endpoint creates a connected account with the following configuration:
 * - Platform controls fee collection (connected account pays Stripe fees)
 * - Stripe handles payment disputes and losses
 * - Connected account gets full access to Stripe dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const { organizationId, email, businessName } = await request.json();

    if (!organizationId || !email) {
      return NextResponse.json(
        { error: 'organizationId and email are required' },
        { status: 400 }
      );
    }

    // Create a connected account using controller properties
    // IMPORTANT: Never use top-level type: 'express', 'standard', or 'custom'
    const account = await stripe.accounts.create({
      // Email for the connected account
      email,
      
      // Controller configuration defines platform-account relationship
      controller: {
        // Platform controls fee collection - connected account pays fees
        fees: {
          payer: 'account' as const
        },
        // Stripe handles payment disputes and losses (recommended for platforms)
        losses: {
          payments: 'stripe' as const
        },
        // Connected account gets full access to Stripe dashboard
        stripe_dashboard: {
          type: 'full' as const
        }
      },
      
      // Business profile information
      business_profile: {
        name: businessName || 'Business',
      },
      
      // Store organization ID in metadata for future reference
      metadata: {
        organizationId,
      },
    });

    return NextResponse.json({
      accountId: account.id,
      email: account.email,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
    });
  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create connected account' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/connect/account?accountId=acct_xxx
 * Retrieves the current status of a connected account
 * 
 * This endpoint fetches account details directly from Stripe API
 * to get real-time onboarding status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    // Retrieve account details from Stripe
    // This gives us real-time status without database queries
    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      accountId: account.id,
      email: account.email,
      // details_submitted indicates if onboarding is complete
      detailsSubmitted: account.details_submitted,
      // charges_enabled indicates if account can accept payments
      chargesEnabled: account.charges_enabled,
      // payouts_enabled indicates if account can receive payouts
      payoutsEnabled: account.payouts_enabled,
      // requirements contains any missing information
      requirements: account.requirements,
    });
  } catch (error: any) {
    console.error('Stripe Connect account retrieval error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve account' },
      { status: 500 }
    );
  }
}
