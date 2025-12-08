
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { adminDb } from '@/firebase/admin';

export async function POST(req: NextRequest) {
    try {
        const { organizationId } = await req.json();

        if (!organizationId) {
            return new NextResponse('Organization ID is required', { status: 400 });
        }

        const orgDoc = await getDoc(doc(adminDb, 'organizations', organizationId));

        if (!orgDoc.exists()) {
            return new NextResponse('Organization not found', { status: 404 });
        }

        const stripeCustomerId = orgDoc.data()?.stripeCustomerId;

        if (!stripeCustomerId) {
            // No customer ID means no invoices, so return an empty array.
            return NextResponse.json([]);
        }

        const invoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit: 100, // Fetch up to 100 invoices
        });
        
        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            date: new Date(invoice.created * 1000).toLocaleDateString(),
            amount: invoice.amount_paid / 100,
            status: invoice.status,
            invoice_pdf: invoice.invoice_pdf,
        }));

        return NextResponse.json(formattedInvoices);
    } catch (error) {
        console.error('[STRIPE_INVOICES_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
