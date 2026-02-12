import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization required' }, { status: 401 });
    }

    const firestore = getFirestore();
    const orgDoc = await firestore.collection('organizations').doc(organizationId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgData = orgDoc.data();
    const customerId = orgData?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json([]);
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toLocaleDateString(),
      amount: invoice.amount_paid / 100,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error: any) {
    console.error('Stripe invoices error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

