'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, ScaleIn, Bounce } from '@/components/ui/animations/transitions';
import { motion } from 'framer-motion';

export default function SuccessPage() {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-primary/5 to-purple-500/10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <FadeIn>
        <Card className="max-w-md border-2 border-green-500/20 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-primary/20 rounded-bl-full" />
          <CardHeader className="text-center relative">
            <ScaleIn delay={0.2}>
              <Bounce>
                <div className="relative inline-block">
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="h-20 w-20 text-green-500" />
                  </motion.div>
                </div>
              </Bounce>
            </ScaleIn>
            <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-primary bg-clip-text text-transparent">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 relative">
            <FadeIn delay={0.4}>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <p>Your payment has been processed successfully</p>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </FadeIn>
            <FadeIn delay={0.6}>
              <Button asChild className="w-full group" size="lg">
                <Link href="/dashboard">
                  Return to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </FadeIn>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
