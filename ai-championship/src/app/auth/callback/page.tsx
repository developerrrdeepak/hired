'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [status, setStatus] = useState('Completing authentication...');

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: 'There was an error signing you in. Please try again.',
        });
        router.push('/login');
        return;
      }

      if (!token) {
        // If no token and no error, just go to login
        router.push('/login');
        return;
      }

      if (!auth) {
        // Wait for auth to be ready
        return;
      }

      try {
        setStatus('Signing in...');
        await signInWithCustomToken(auth, token);
        
        // After signing in, get the token result to check claims for redirection
        const user = auth.currentUser;
        if (user) {
            const idTokenResult = await user.getIdTokenResult();
            const role = idTokenResult.claims.role;
            
            toast({
            title: 'Welcome back!',
            description: 'Successfully signed in.',
            });

            if (role === 'Owner') {
                router.push('/dashboard');
            } else {
                router.push('/candidate-portal/dashboard');
            }
        } else {
             // Fallback if user is somehow null
             router.push('/dashboard');
        }

      } catch (err) {
        console.error('Auth callback error:', err);
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: 'Could not verify your session.',
        });
        router.push('/login');
      }
    };

    handleAuth();
  }, [auth, router, searchParams, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">{status}</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
