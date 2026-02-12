'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-plans';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { FadeIn, ScaleIn } from '@/components/ui/animations/transitions';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'Candidate';
  const { user } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const isCandidate = role === 'Candidate';
  const plans = isCandidate ? STRIPE_PLANS.candidate : STRIPE_PLANS.employer;

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      toast({ title: 'Free Plan', description: 'You are already on the free plan!' });
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(planName);

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
          userEmail: user.email,
          role,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <FadeIn>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg">
            {isCandidate ? 'Accelerate your career growth' : 'Find the best talent faster'}
          </p>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(plans).map(([key, plan], index) => (
          <ScaleIn key={key} delay={index * 0.1}>
            <Card className="p-6 relative hover:shadow-xl transition-all border-2 hover:border-primary">
              {key === 'pro' || key === 'growth' ? (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Popular
                </div>
              ) : null}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={key === 'pro' || key === 'growth' ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
              >
                {loading === plan.name ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Subscribe'}
              </Button>
            </Card>
          </ScaleIn>
        ))}
      </div>
    </div>
  );
}


