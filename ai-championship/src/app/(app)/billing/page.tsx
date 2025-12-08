
'use client';

import { useState, useEffect, Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Download, Check, Loader2, FileText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUserContext } from '../layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const plans = [
    {
        id: 'price_1P6iGgRshyApySbPOIIsTjLe',
        name: 'Startup',
        price: 99,
        features: ['5 Job Posts', '500 Applicants', 'Basic Analytics', 'AI Assistant', 'Email Support'],
        isPopular: false,
    },
    {
        id: 'price_1P6iHJRshyApySbP82uN9Yw1',
        name: 'Growth',
        price: 249,
        features: ['Unlimited Jobs', '5000 Applicants', 'Advanced Analytics', 'Priority AI Assistant', 'Priority Support'],
        isPopular: true,
    },
    {
        id: 'price_1P6iHrRshyApySbP5p1iE6fS',
        name: 'Enterprise',
        price: 0,
        features: ['Volume Discounts', 'Custom Integrations', 'Dedicated Account Manager', 'SAML SSO', 'Premium Support'],
        isPopular: false,
    }
];

interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: string;
    invoice_pdf?: string;
}

function BillingStatus() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    
    if (success) {
        return (
            <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow" role="alert">
                <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3" />
                    <div>
                        <p className="font-bold">Payment Successful!</p>
                        <p>Your subscription has been activated. Welcome aboard!</p>
                    </div>
                </div>
            </div>
        );
    }

    if (cancelled) {
        return (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
                <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-3" />
                    <div>
                        <p className="font-bold">Payment Cancelled</p>
                        <p>Your transaction was not completed. Please try again or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
}

export default function BillingPage() {
    const { organization, subscription, isUserLoading } = useUserContext();
    const { toast } = useToast();
    const [isRedirecting, setIsRedirecting] = useState<Record<string, boolean>>({});
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (!organization?.id) return;
            setIsLoadingInvoices(true);
            try {
                const res = await fetch('/api/stripe/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ organizationId: organization.id }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setInvoices(data);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch invoices.' });
                }
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
            } finally {
                setIsLoadingInvoices(false);
            }
        };

        if (organization?.id) {
            fetchInvoices();
        } else if (!isUserLoading) {
            setIsLoadingInvoices(false);
        }
    }, [organization?.id, isUserLoading, toast]);

    const handleCreateCheckout = async (priceId: string) => {
        if (!organization?.id) return;
        setIsRedirecting(prev => ({...prev, [priceId]: true}));
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    organizationId: organization.id,
                }),
            });
            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not redirect to checkout.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setIsRedirecting(prev => ({...prev, [priceId]: false}));
        }
    };
    
    const handleCreatePortal = async () => {
        if (!organization?.id) return;
        setIsRedirecting(prev => ({...prev, portal: true}));
        try {
            const res = await fetch('/api/stripe/create-portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: organization.id,
                }),
            });
            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not open customer portal.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
             setIsRedirecting(prev => ({...prev, portal: false}));
        }
    }
    
    const currentPlan = plans.find(p => p.id === subscription?.priceId);

    if(isUserLoading) return <p>Loading...</p>

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div>
                <PageHeader
                    title="Billing & Subscriptions"
                    description="Manage your plan, payment methods, and view invoices."
                />
                <div className="mt-6 space-y-8">
                    <BillingStatus />
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>Your active subscription details.</CardDescription>
                            </div>
                            <Button
                                onClick={handleCreatePortal}
                                disabled={isRedirecting['portal'] || !subscription}
                            >
                                {isRedirecting['portal'] ? 'Redirecting...' : 'Manage Subscription'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {subscription?.status === 'active' && currentPlan ? (
                                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                                        <p className="text-muted-foreground">${currentPlan.price}/month</p>
                                    </div>
                                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="capitalize bg-green-100 text-green-800">
                                        {subscription.status}
                                    </Badge>
                                </div>
                            ) : (
                                 <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                    <h3 className="text-lg font-medium text-muted-foreground">No active subscription</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Choose a plan below to get started.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map(plan => (
                                <Card key={plan.id} className={`flex flex-col ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
                                    {plan.isPopular && <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">POPULAR</Badge>}
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>
                                            {plan.price > 0 ? (
                                                <span className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                                            ) : (
                                                 <span className="text-3xl font-bold">Custom</span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {plan.features.map(feature => (
                                                <li key={feature} className="flex items-center">
                                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                         <Button
                                            className="w-full"
                                            disabled={isRedirecting[plan.id] || (plan.id === currentPlan?.id && subscription?.status === 'active')}
                                            onClick={() => plan.price > 0 ? handleCreateCheckout(plan.id) : null}
                                            variant={plan.isPopular ? 'default' : 'outline'}
                                         >
                                            {isRedirecting[plan.id] ? 'Redirecting...' : (plan.id === currentPlan?.id && subscription?.status === 'active' ? 'Current Plan' : (plan.price > 0 ? 'Subscribe' : 'Contact Sales'))}
                                         </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </section>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing History</CardTitle>
                             <CardDescription>Your past invoices and payment records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingInvoices ? (
                                         <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <div className="flex justify-center items-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : invoices.length > 0 ? (
                                        invoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">inv_{invoice.id.substring(3, 10)}</TableCell>
                                                <TableCell>{invoice.date}</TableCell>
                                                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                                <TableCell><Badge variant="outline" className={invoice.status === 'paid' ? 'text-green-600 border-green-200 bg-green-50 capitalize' : 'capitalize'}>{invoice.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    {invoice.invoice_pdf && (
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <div className="text-center py-12">
                                                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="text-lg font-medium">No invoices found</h3>
                                                    <p className="text-muted-foreground text-sm mt-1">Your billing history will appear here.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </Suspense>
    );
}
