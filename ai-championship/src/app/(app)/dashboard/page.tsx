'use client';

import { useUserRole } from '@/hooks/use-user-role';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { role, isLoading } = useUserRole();
  const router = useRouter();

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
          // Stay here if role is unknown or 'Employee' without specific dash
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
