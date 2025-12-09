'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useUserContext } from '../layout';

export default function ConnectPage() {
  const { organization } = useUserContext();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState<string>('');
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');

  useEffect(() => {
    const savedAccountId = localStorage.getItem(`stripe_account_${organization?.id}`);
    if (savedAccountId) {
      setAccountId(savedAccountId);
      fetchAccountStatus(savedAccountId);
    }
  }, [organization?.id]);

  const fetchAccountStatus = async (accId: string) => {
    try {
      const res = await fetch(`/api/stripe/connect/account?accountId=${accId}`);
      const data = await res.json();
      if (res.ok) setAccountStatus(data);
    } catch (error) {
      console.error('Failed to fetch account status:', error);
    }
  };

  const handleCreateAccount = async () => {
    if (!organization?.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Organization not found' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization.id,
          email: organization.email || 'employer@example.com',
          businessName: organization.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccountId(data.accountId);
        setAccountStatus(data);
        localStorage.setItem(`stripe_account_${organization.id}`, data.accountId);
        toast({ title: 'Success', description: 'Connected account created!' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start onboarding' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName || !productPrice) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name and price required' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          name: productName,
          description: productDescription,
          priceInCents: Math.round(parseFloat(productPrice) * 100),
          currency: 'usd',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Success', description: 'Product created!' });
        setProductName('');
        setProductDescription('');
        setProductPrice('');
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Stripe Connect Integration</h1>
      {!accountId && (
        <Card>
          <CardHeader>
            <CardTitle>Create Connected Account</CardTitle>
            <CardDescription>Start accepting payments from candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateAccount} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </CardContent>
        </Card>
      )}
      {accountId && (
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Account ID: {accountId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {accountStatus?.detailsSubmitted ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
              <span>Onboarding Complete: {accountStatus?.detailsSubmitted ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              {accountStatus?.chargesEnabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
              <span>Charges Enabled: {accountStatus?.chargesEnabled ? 'Yes' : 'No'}</span>
            </div>
            {!accountStatus?.detailsSubmitted && (
              <Button onClick={handleOnboard} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Onboard to Collect Payments
              </Button>
            )}
            <Button variant="outline" onClick={() => fetchAccountStatus(accountId)}>Refresh Status</Button>
          </CardContent>
        </Card>
      )}
      {accountId && accountStatus?.chargesEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Create Product</CardTitle>
            <CardDescription>Add products to your storefront</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Premium Job Posting" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="30-day featured listing" />
            </div>
            <div>
              <Label>Price (USD)</Label>
              <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="99.00" />
            </div>
            <Button onClick={handleCreateProduct} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
