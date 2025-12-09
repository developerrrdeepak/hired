'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function StorefrontPage() {
  const params = useParams();
  const accountId = params.accountId as string;
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [accountId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/stripe/connect/products?accountId=${accountId}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyProduct = async (priceId: string, productName: string, amount: number) => {
    setLoading(true);
    try {
      const applicationFee = Math.round(amount * 0.10);
      const res = await fetch('/api/stripe/connect/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          priceId,
          quantity: 1,
          applicationFeeAmount: applicationFee,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create checkout' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Storefront</h1>
        <p className="text-muted-foreground">Browse and purchase products</p>
      </div>
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No products available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const price = product.defaultPrice;
            const amount = price?.unit_amount || 0;
            const currency = price?.currency || 'usd';
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ${(amount / 100).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{currency.toUpperCase()}</span>
                  </div>
                  <Button className="w-full" onClick={() => handleBuyProduct(price.id, product.name, amount)} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
