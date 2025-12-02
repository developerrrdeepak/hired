'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, MapPin, Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRecommendedJobs } from '@/hooks/use-recommended-jobs';
import { getMatchScoreColor, getMatchScoreLabel } from '@/lib/job-matching';
import { JobCard } from '@/components/job-card';
import type { CandidateProfile } from '@/lib/job-matching';

export default function JobRecommendationsPage() {
  const { user, firestore } = useFirebase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Fetch candidate profile
  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<any>(userRef);

  // Build candidate profile for matching
  const candidateProfile: CandidateProfile | null = useMemo(() => {
    if (!userProfile) return null;
    return {
      skills: userProfile.skills || [],
      location: userProfile.location || '',
      yearsOfExperience: userProfile.yearsOfExperience || 0,
      preferredLocation: userProfile.preferredLocation || 'Remote',
    };
  }, [userProfile]);

  // Get recommended jobs with real-time updates
  const { recommendedJobs, isLoading: isLoadingJobs, error } = useRecommendedJobs(candidateProfile);

  const isLoading = isLoadingProfile || isLoadingJobs;

  // Group jobs by match score
  const { excellentMatches, goodMatches, fairMatches } = useMemo(() => {
    return {
      excellentMatches: recommendedJobs.filter(j => j.matchScore >= 80),
      goodMatches: recommendedJobs.filter(j => j.matchScore >= 60 && j.matchScore < 80),
      fairMatches: recommendedJobs.filter(j => j.matchScore >= 40 && j.matchScore < 60),
    };
  }, [recommendedJobs]);

  if (isLoading) {
    return <JobRecommendationsSkeleton />;
  }

  if (error) {
    return (
      <div className={`transform transition-all duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <PageHeader
          title="Job Recommendations"
          description="AI-powered job matches based on your profile"
        />
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading recommendations. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!candidateProfile || !candidateProfile.skills || candidateProfile.skills.length === 0) {
    return (
      <div className={`transform transition-all duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <PageHeader
          title="Job Recommendations"
          description="AI-powered job matches based on your profile"
        />
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Add your skills, location, and experience to get personalized job recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/profile/edit">
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`transform transition-all duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <PageHeader
        title="Job Recommendations"
        description="AI-powered job matches based on your profile"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{recommendedJobs.length} Matches Found</span>
        </div>
      </PageHeader>

      {/* Profile Summary */}
      <Card className="glassmorphism mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{candidateProfile.yearsOfExperience} years experience</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{candidateProfile.location || 'Location not set'}</span>
          </div>
          {candidateProfile.skills && candidateProfile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {candidateProfile.skills.slice(0, 10).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidateProfile.skills.length > 10 && (
                <Badge variant="secondary" className="text-xs">
                  +{candidateProfile.skills.length - 10} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excellent Matches */}
      {excellentMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Excellent Matches ({excellentMatches.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {excellentMatches.map((job, i) => (
              <div key={job.id} className="relative">
                <JobCard job={job} showApplyButton={true} delay={i * 50} />
                <div className="absolute top-3 right-3">
                  <Badge className={getMatchScoreColor(job.matchScore)}>
                    {job.matchScore}% Match
                  </Badge>
                </div>
                {job.matchReasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good Matches */}
      {goodMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Good Matches ({goodMatches.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goodMatches.map((job, i) => (
              <div key={job.id} className="relative">
                <JobCard job={job} showApplyButton={true} delay={i * 50} />
                <div className="absolute top-3 right-3">
                  <Badge className={getMatchScoreColor(job.matchScore)}>
                    {job.matchScore}% Match
                  </Badge>
                </div>
                {job.matchReasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fair Matches */}
      {fairMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold">Fair Matches ({fairMatches.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fairMatches.map((job, i) => (
              <div key={job.id} className="relative">
                <JobCard job={job} showApplyButton={true} delay={i * 50} />
                <div className="absolute top-3 right-3">
                  <Badge className={getMatchScoreColor(job.matchScore)}>
                    {job.matchScore}% Match
                  </Badge>
                </div>
                {job.matchReasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {job.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Matches */}
      {recommendedJobs.length === 0 && (
        <Card className="glassmorphism">
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any jobs matching your profile at the moment.
            </p>
            <Button asChild variant="outline">
              <Link href="/jobs">
                Browse All Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function JobRecommendationsSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title="Job Recommendations"
        description="AI-powered job matches based on your profile"
      >
        <Skeleton className="h-10 w-40" />
      </PageHeader>
      
      <Card className="glassmorphism mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div>
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="glassmorphism h-64">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
