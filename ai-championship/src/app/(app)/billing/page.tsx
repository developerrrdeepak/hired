'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, CreditCard, Calendar, Download, FileText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUserContext } from '../layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useUserContext();
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  // Simulate fetching subscription status
  useEffect(() => {
    const success = searchParams.get('success');
    const plan = searchParams.get('plan');
    
    if (success && plan) {
      setSubscription({
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        status: 'active',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        amount: plan === 'pro' ? '$99.00' : '$29.00'
      });
      // Simulate an invoice being generated
       setInvoices([
        {
            id: 'inv_123456789',
            date: new Date().toLocaleDateString(),
            amount: plan === 'pro' ? '$99.00' : '$29.00',
            status: 'Paid',
            plan: plan.charAt(0).toUpperCase() + plan.slice(1)
        }
    ]);
    }
  }, [searchParams]);

  return (
    <div className="space-y-8 py-8 container max-w-5xl mx-auto">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your plan and payment methods."
      />

      <div className="grid gap-6">
        {subscription ? (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle>Active Subscription</CardTitle>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white border-green-200 text-green-700 hover:bg-green-50">Manage Subscription</Button>
                    <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                </div>
              </div>
              <CardDescription>You are currently subscribed to the <strong>{subscription.plan}</strong> plan.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Payment Method</p>
                        <p className="text-xs text-muted-foreground">Visa ending in 4242</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Next Billing Date</p>
                        <p className="text-xs text-muted-foreground">{subscription.nextBilling} ({subscription.amount})</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>You are currently on the free tier.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Upgrade to unlock unlimited job postings and AI features.</span>
              </div>
              <Button asChild>
                <a href="/pricing">View Plans</a>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                {invoices.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead className="text-right">Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell>{invoice.plan}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Download className="h-4 w-4" />
                                            <span className="sr-only">Download</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="bg-muted/50 p-4 rounded-full mb-3">
                             <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No invoices found</p>
                        <p className="text-sm text-muted-foreground mt-1">You haven't been billed yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
