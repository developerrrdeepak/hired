'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { subscribeToAllChallenges } from '@/lib/firestore-service';

export function useChallenges() {
  const { firestore } = useFirebase();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) {
      setChallenges([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const subscription = subscribeToAllChallenges(
      firestore,
      (updatedChallenges) => {
        setChallenges(updatedChallenges);
        setIsLoading(false);
      },
      (err) => {
        setChallenges([]);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [firestore]);

  return { challenges, isLoading, error };
}
