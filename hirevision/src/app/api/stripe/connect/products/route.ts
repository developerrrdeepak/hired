import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// PLACEHOLDER: Ensure STRIPE_SECRET_KEY is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

/**
 * POST /api/stripe/connect/products
 * Creates a product on a connected account
 * 
 * Uses the Stripe-Account header to create products directly
 * on the connected account, not the platform account
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId, name, description, priceInCents, currency } = await request.json();

    if (!accountId || !name || !priceInCents) {
      return NextResponse.json(
        { error: 'accountId, name, and priceInCents are required' },
        { status: 400 }
      );
    }

    // Create product on the connected account using stripeAccount option
    // This sets the Stripe-Account header to create resources on their account
    const product = await stripe.products.create(
      {
        // Product name (e.g., "Premium Job Posting")
        name,
        
        // Product description
        description: description || '',
        
        // Create a default price with the product
        default_price_data: {
          // Price in cents (e.g., 9900 = $99.00)
          unit_amount: priceInCents,
          
          // Currency code (e.g., 'usd', 'eur')
          currency: currency || 'usd',
        },
      },
      {
        // IMPORTANT: stripeAccount option sets the Stripe-Account header
        // This creates the product on the connected account, not platform
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      productId: product.id,
      name: product.name,
      description: product.description,
      defaultPriceId: product.default_price,
    });
  } catch (error: any) {
    console.error('Stripe Connect product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/connect/products?accountId=acct_xxx
 * Lists all products for a connected account
 * 
 * Uses the Stripe-Account header to retrieve products from
 * the connected account's catalog
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

    // List products from the connected account
    // stripeAccount option retrieves products from their account
    const products = await stripe.products.list(
      {
        // Limit results for performance
        limit: 100,
        
        // Include default price data in response
        expand: ['data.default_price'],
      },
      {
        // Retrieve products from connected account
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({
      products: products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        defaultPrice: product.default_price,
        images: product.images,
      })),
    });
  } catch (error: any) {
    console.error('Stripe Connect products list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list products' },
      { status: 500 }
    );
  }
}

