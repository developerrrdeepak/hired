'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bounce } from '@/components/ui/animations/transitions';

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      router.push('/pricing');
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Bounce>
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
              <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your subscription has been activated. Welcome aboard!
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push('/billing')}>
              View Billing
            </Button>
          </div>
        </div>
      </Bounce>
    </div>
  );
}


