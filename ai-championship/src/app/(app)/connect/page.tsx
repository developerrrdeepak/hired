'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Store, CreditCard, Package, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useUserContext } from '../layout';
import { FadeIn, SlideIn, ScaleIn, Pulse } from '@/components/ui/animations/transitions';
import Link from 'next/link';

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
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Stripe Connect</h1>
            <p className="text-muted-foreground mt-2">Accept payments and manage your storefront</p>
          </div>
          {accountId && accountStatus?.chargesEnabled && (
            <Button asChild variant="outline">
              <Link href={`/connect/storefront/${accountId}`}>
                <Store className="mr-2 h-4 w-4" />
                View Storefront
              </Link>
            </Button>
          )}
        </div>
      </FadeIn>

      {accountId && accountStatus?.chargesEnabled && (
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-bold">+0%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      )}
      {!accountId && (
        <SlideIn direction="up" delay={0.2}>
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Create Connected Account</CardTitle>
                  <CardDescription>Start accepting payments from candidates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateAccount} disabled={loading} size="lg" className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </CardContent>
          </Card>
        </SlideIn>
      )}
      {accountId && (
        <SlideIn direction="up" delay={0.2}>
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription className="font-mono text-xs">{accountId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScaleIn delay={0.3}>
                  <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: accountStatus?.detailsSubmitted ? 'rgb(34 197 94)' : 'rgb(239 68 68)' }}>
                    <div className="flex items-center gap-3">
                      {accountStatus?.detailsSubmitted ? (
                        <Pulse><CheckCircle className="h-6 w-6 text-green-500" /></Pulse>
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold">Onboarding</p>
                        <p className="text-sm text-muted-foreground">{accountStatus?.detailsSubmitted ? 'Complete' : 'Pending'}</p>
                      </div>
                    </div>
                  </div>
                </ScaleIn>
                <ScaleIn delay={0.4}>
                  <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: accountStatus?.chargesEnabled ? 'rgb(34 197 94)' : 'rgb(239 68 68)' }}>
                    <div className="flex items-center gap-3">
                      {accountStatus?.chargesEnabled ? (
                        <Pulse><CheckCircle className="h-6 w-6 text-green-500" /></Pulse>
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold">Charges</p>
                        <p className="text-sm text-muted-foreground">{accountStatus?.chargesEnabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                </ScaleIn>
              </div>
              <div className="flex gap-2">
                {!accountStatus?.detailsSubmitted && (
                  <Button onClick={handleOnboard} disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Onboard to Collect Payments
                  </Button>
                )}
                <Button variant="outline" onClick={() => fetchAccountStatus(accountId)}>Refresh</Button>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      )}
      {accountId && accountStatus?.chargesEnabled && (
        <SlideIn direction="up" delay={0.3}>
          <Card className="border-2 border-primary/20 hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Create Product</CardTitle>
                  <CardDescription>Add products to your storefront</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Premium Job Posting" />
                </div>
                <div>
                  <Label>Price (USD)</Label>
                  <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="99.00" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="30-day featured listing" />
              </div>
              <Button onClick={handleCreateProduct} disabled={loading} size="lg" className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Package className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </CardContent>
          </Card>
        </SlideIn>
      )}
    </div>
  );
}
