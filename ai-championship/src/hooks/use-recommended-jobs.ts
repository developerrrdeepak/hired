'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Job } from '@/lib/definitions';
import { getRecommendedJobs, type CandidateProfile, type JobMatch } from '@/lib/job-matching';

export function useRecommendedJobs(candidateProfile: CandidateProfile | null) {
  const { firestore } = useFirebase();
  const [recommendedJobs, setRecommendedJobs] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !candidateProfile) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Subscribe to all organizations to get all open jobs
    const unsubscribes: (() => void)[] = [];
    const allJobs: Job[] = [];

    // Get all organizations first
    const orgsRef = collection(firestore, 'organizations');
    
    const fetchJobs = async () => {
      try {
        // For simplicity, we'll query jobs from a known set of organizations
        // In production, you'd want to query all organizations or use a jobs index
        const orgIds = ['org-demo-owner-id']; // Add more org IDs as needed
        
        let completedOrgs = 0;
        
        for (const orgId of orgIds) {
          const jobsRef = collection(firestore, `organizations/${orgId}/jobs`);
          const jobsQuery = query(jobsRef, where('status', '==', 'open'));
          
          const unsubscribe = onSnapshot(
            jobsQuery,
            (snapshot) => {
              // Remove old jobs from this org
              const filteredJobs = allJobs.filter(j => j.organizationId !== orgId);
              
              // Add new jobs from this org
              const orgJobs = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                organizationId: orgId,
              } as Job));
              
              allJobs.length = 0;
              allJobs.push(...filteredJobs, ...orgJobs);
              
              // Calculate recommendations
              const recommended = getRecommendedJobs(candidateProfile, allJobs);
              setRecommendedJobs(recommended);
              
              completedOrgs++;
              if (completedOrgs >= orgIds.length) {
                setIsLoading(false);
              }
            },
            (err) => {
              console.error('Error fetching jobs:', err);
              setError(err);
              setIsLoading(false);
            }
          );
          
          unsubscribes.push(unsubscribe);
        }
      } catch (err) {
        console.error('Error setting up job subscriptions:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchJobs();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [firestore, candidateProfile]);

  return { recommendedJobs, isLoading, error };
}
