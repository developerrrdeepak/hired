'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/(app)/layout';

export function KeyboardShortcuts() {
  const router = useRouter();
  const { role } = useUserContext();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if Cmd/Ctrl + K is pressed
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            // Command palette is already handled by CommandPalette component
            break;
          case 'j':
            e.preventDefault();
            router.push('/jobs');
            break;
          case 'h':
            e.preventDefault();
            router.push(role === 'Candidate' ? '/candidate-portal/dashboard' : '/dashboard');
            break;
          case 'm':
            e.preventDefault();
            router.push('/messages');
            break;
          case 'n':
            e.preventDefault();
            if (role !== 'Candidate') router.push('/jobs/new');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router, role]);

  return null;
}


