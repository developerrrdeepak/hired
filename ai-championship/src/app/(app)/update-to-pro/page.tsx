'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/page-loader';

export default function UpdateToProPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/upgrade');
  }, [router]);

  return <PageLoader />;
}
