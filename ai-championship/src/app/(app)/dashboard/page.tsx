'use client';

import { useUserRole } from '@/hooks/use-user-role';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { signInWithCustomToken } from 'firebase/auth';

export default function DashboardPage() {
  const { role, isLoading } = useUserRole();
  const { auth } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Old logic for backward compatibility, though new auth flow uses /auth/callback
    const token = searchParams.get('token');
    if (token && auth) {
      signInWithCustomToken(auth, token)
        .then(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          url.searchParams.delete('provider');
          window.history.replaceState({}, '', url.toString());
        })
        .catch((err) => {
            console.error("Token sign-in failed on dashboard:", err);
            router.push('/login?error=' + encodeURIComponent('Authentication failed'));
        });
    }
  }, [searchParams, auth, router]);

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        // If not loading and no role, redirect to login
        // But we should verify if a user object exists at all first?
        // useUserRole hooks usually derives from user context.
        // If user is null, role is null.
        router.replace('/login');
        return;
      }

      switch (role) {
        case 'Candidate':
          router.replace('/candidate-portal/dashboard');
          break;
        case 'Recruiter':
          router.replace('/recruiter/dashboard');
          break;
        case 'Founder':
        case 'Owner':
          router.replace('/founder/dashboard');
          break;
        case 'Hiring Manager':
          router.replace('/hiring-manager/dashboard');
          break;
        default:
          // Fallback or unknown role
          break;
      }
    }
  }, [role, isLoading, router]);

  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <span className="text-muted-foreground">Redirecting to your dashboard...</span>
      </div>
    </div>
  );
}
