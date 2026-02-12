'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Zap, Crown, Rocket } from 'lucide-react';
import { useUserContext } from '../layout';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const PRO_FEATURES = [
  'Unlimited job postings',
  'Advanced AI Matching & Screening',
  'AI Interview Copilot',
  'Video Interview Recording',
  'Priority Support',
  'Advanced Analytics Dashboard',
  'Custom Branding',
  'API Access',
];

const FREE_FEATURES = [
  'Up to 3 active job postings',
  'Basic AI Candidate Matching',
  'Community Access',
  'Email Support',
];

export default function UpgradePage() {
  const { user, isUserLoading } = useUserContext();
  const { toast } = useToast();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to upgrade.' });
      router.push('/login');
      return;
    }

    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: 'pro', 
          userId: user.uid, 
          email: user.email 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to start checkout');

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Could not initiate upgrade.' 
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-8 py-8 container max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Crown className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Upgrade to Pro
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full power of AI-driven recruitment and take your hiring to the next level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Free Plan */}
        <Card className="relative flex flex-col border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <CardDescription>Your current plan</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
              {FREE_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative flex flex-col border-primary shadow-lg scale-105 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary hover:to-purple-600 px-4 py-1 text-sm font-medium uppercase tracking-wide">
              Recommended
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Professional Plan
            </CardTitle>
            <CardDescription>For growing companies</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
              {PRO_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              disabled={isUpgrading || isUserLoading}
              onClick={handleUpgrade}
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
        <CardHeader>
          <CardTitle>Why Upgrade to Pro?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Faster Hiring</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered screening reduces time-to-hire by up to 70%
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Better Matches</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI finds candidates that perfectly fit your requirements
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Scale Effortlessly</h3>
              <p className="text-sm text-muted-foreground">
                Handle unlimited job postings and candidates with ease
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Have questions? <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/pricing')}>View full pricing details</Button>
        </p>
      </div>
    </div>
  );
}


