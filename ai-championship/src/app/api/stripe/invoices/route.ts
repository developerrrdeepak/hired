
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        return NextResponse.json([]);
    } catch (error) {
        console.error('[STRIPE_INVOICES_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
