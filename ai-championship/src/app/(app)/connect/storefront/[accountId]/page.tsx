'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, Sparkles, Tag, TrendingUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FadeIn, SlideIn, ScaleIn, StaggerContainer } from '@/components/ui/animations/transitions';
import { motion } from 'framer-motion';

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
      <FadeIn>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">Storefront</h1>
          </div>
          <p className="text-muted-foreground text-lg">Browse and purchase premium products</p>
        </div>
      </FadeIn>
      {products.length === 0 ? (
        <SlideIn direction="up" delay={0.2}>
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              </motion.div>
              <p className="text-xl font-semibold mb-2">No products available yet</p>
              <p className="text-muted-foreground">Check back soon for new products!</p>
            </CardContent>
          </Card>
        </SlideIn>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {products.map((product, index) => {
            const price = product.defaultPrice;
            const amount = price?.unit_amount || 0;
            const currency = price?.currency || 'usd';
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </div>
                      {index === 0 && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Tag className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        ${(amount / 100).toFixed(2)}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">{currency.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Platform fee: 10%</span>
                    </div>
                    <Button 
                      className="w-full group-hover:scale-105 transition-transform" 
                      size="lg"
                      onClick={() => handleBuyProduct(price.id, product.name, amount)} 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
