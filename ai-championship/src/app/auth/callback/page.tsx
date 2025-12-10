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
      const provider = searchParams.get('provider');

      // 1. Handle Errors Redirected from Server
      if (error) {
        console.error('Auth Callback Error:', error);
        toast({
          variant: 'destructive',
          title: 'Authentication Failed',
          description: decodeURIComponent(error),
        });
        router.replace('/login');
        return;
      }

      // 2. Validate Token Presence
      if (!token) {
        router.replace('/login');
        return;
      }

      // 3. Wait for Firebase SDK
      if (!auth) return;

      try {
        setStatus('Securely signing you in...');
        console.log('🔐 Received token from', provider, '- Attempting sign-in...');
        
        // 4. Exchange Custom Token for Firebase Session
        const userCredential = await signInWithCustomToken(auth, token);
        const user = userCredential.user;
        
        console.log('✅ Sign-in successful for:', user.email);

        // 5. Check Role and Redirect
        if (user) {
            const idTokenResult = await user.getIdTokenResult(true); // Force refresh to get latest claims
            const role = idTokenResult.claims.role;
            const orgId = idTokenResult.claims.organizationId;
            
            console.log('🎭 User Role:', role, 'Org:', orgId);

            toast({
              title: 'Welcome!',
              description: `Signed in successfully as ${role || 'User'}.`,
            });

            const targetPath = role === 'Owner' ? '/dashboard' : '/candidate-portal/dashboard';
            
            // Use replace to clear the token from browser history
            router.replace(targetPath);
        } else {
             throw new Error('User object missing after sign-in');
        }

      } catch (err: any) {
        console.error('❌ Auth callback execution failed:', err);
        toast({
          variant: 'destructive',
          title: 'Sign In Error',
          description: err.message || 'Could not verify your session.',
        });
        router.replace('/login');
      }
    };

    handleAuth();
  }, [auth, router, searchParams, toast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto relative z-10" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{status}</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Verifying your credentials and setting up your workspace...
        </p>
      </div>
    </div>
  );
}
