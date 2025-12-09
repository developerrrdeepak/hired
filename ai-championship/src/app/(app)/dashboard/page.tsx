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
    const token = searchParams.get('token');
    if (token && auth) {
      signInWithCustomToken(auth, token)
        .then(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          url.searchParams.delete('provider');
          window.history.replaceState({}, '', url.toString());
        })
        .catch(() => {});
    }
  }, [searchParams, auth]);

  useEffect(() => {
    if (!isLoading && role) {
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
          break;
      }
    }
  }, [role, isLoading, router]);

  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Redirecting to your dashboard...</span>
    </div>
  );
}
