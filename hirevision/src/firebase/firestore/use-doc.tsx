'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, DocumentReference } from 'firebase/firestore';

export function useDoc<T>(docRef: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
        setData(null);
        setLoading(false);
        return;
    };

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData({ ...docSnap.data(), id: docSnap.id } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching document:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}


