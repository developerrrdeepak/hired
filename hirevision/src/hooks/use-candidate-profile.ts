'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { subscribeToCandidateProfile } from '@/lib/firestore-service';

export function useCandidateProfile() {
  const { firestore, user } = useFirebase();
  const [candidate, setCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const subscription = subscribeToCandidateProfile(
      firestore,
      user.uid,
      (profile) => {
        setCandidate(profile);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [firestore, user]);

  return { candidate, isLoading, error };
}

