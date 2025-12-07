'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Zap, HelpCircle } from 'lucide-react';
import { useUserContext } from '../layout';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams and startups.',
    price: 29,
    interval: 'month',
    features: [
      'Up to 10 active job postings',
      'Basic AI Candidate Matching',
      'Community Access',
      'Email Support',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For growing companies with active hiring needs.',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited job postings',
      'Advanced AI Matching & Screening',
      'AI Interview Copilot',
      'Video Interview Recording',
      'Priority Support',
    ],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations.',
    price: 299,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Dedicated Account Manager',
      'Custom AI Model Fine-tuning',
      'SSO & Advanced Security',
      'SLA & 24/7 Support',
    ],
    highlight: false,
  },
];

const FAQS = [
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
  },
  {
    question: "Is there a free trial available?",
    answer: "We offer a 14-day free trial for our Professional plan so you can experience the full power of our AI features."
  },
  {
    question: "How does the AI candidate matching work?",
    answer: "Our AI analyzes job descriptions and candidate profiles to identify the best matches based on skills, experience, and cultural fit, saving you hours of screening time."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards including Visa, Mastercard, and American Express. Enterprise customers can also pay via invoice."
  }
];

export default function PricingPage() {
  const { user, isUserLoading } = useUserContext();
  const { toast } = useToast();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to subscribe.' });
      router.push('/login');
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid, email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to start checkout');

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Could not initiate checkout.' 
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-12 py-8 container max-w-7xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your hiring needs. Upgrade or cancel at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {PRICING_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col ${plan.highlight ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1 text-sm font-medium uppercase tracking-wide">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.highlight ? 'default' : 'outline'}
                disabled={!!loadingPlan || isUserLoading}
                onClick={() => handleSubscribe(plan.id)}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                {loadingPlan === plan.id ? 'Processing...' : `Get ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto pt-12 space-y-8">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Have questions? We're here to help.</p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}
