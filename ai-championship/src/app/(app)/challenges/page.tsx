
'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { Challenge } from '@/lib/definitions';
import { collection, query } from 'firebase/firestore';
import { PlusCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useUserContext } from '../layout';
import { ChallengeCard } from '@/components/challenge-card';

export default function ChallengesPage() {
    const { firestore } = useFirebase();
    const { role, organizationId, isUserLoading } = useUserContext();
    const isCandidate = role === 'Candidate';

    const challengesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const orgId = organizationId || 'org-demo-owner-id';
        return query(collection(firestore, `organizations/${orgId}/challenges`));
    }, [firestore, organizationId]);
    
    const { data: challenges, isLoading: areChallengesLoading } = useCollection<Challenge>(challengesQuery);
    const isLoading = isUserLoading || areChallengesLoading;

    const pageTitle = isCandidate ? "Active Challenges" : "Manage Challenges";
    const pageDescription = isCandidate ? "Test your skills and get noticed by top companies." : "Create and manage coding challenges, hackathons, and case studies.";

    if (isLoading) {
        return <ChallengesPageSkeleton isCandidate={isCandidate} />
    }

    return (
        <>
            <PageHeader
                title={pageTitle}
                description={pageDescription}
            >
                {!isCandidate && (
                    <Button asChild>
                    <Link href={`/challenges/new?role=${role || ''}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Challenge
                    </Link>
                    </Button>
                )}
            </PageHeader>
            
            {challenges && challenges.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map((challenge, i) => (
                        <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            showJoinButton={isCandidate}
                            delay={i * 100} 
                        />
                    ))}
                </div>
            ) : (
                <Card className={cn("col-span-full flex flex-col items-center justify-center py-20 text-center", isCandidate && "glassmorphism")}>
                    <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Challenges Yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                       {isCandidate ? "There are no active challenges at the moment. Check back soon to test your skills!" : "Get started by creating your first coding challenge, case study, or hackathon for your candidates."}
                    </p>
                    {!isCandidate && (
                        <Button asChild className="mt-6">
                            <Link href={`/challenges/new?role=${role || ''}`}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create First Challenge
                            </Link>
                        </Button>
                    )}
                </Card>
            )}
        </>
    )
}

function ChallengesPageSkeleton({ isCandidate }: { isCandidate: boolean }) {
    const pageTitle = isCandidate ? "Active Challenges" : "Manage Challenges";
    const pageDescription = isCandidate ? "Test your skills and get noticed by top companies." : "Create and manage coding challenges, hackathons, and case studies.";

    return (
        <>
            <PageHeader
                title={pageTitle}
                description={pageDescription}
            >
                {!isCandidate && (
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Challenge
                    </Button>
                )}
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className={cn(isCandidate && "glassmorphism", "h-64")}>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-4 w-1/2" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-10 w-2/5" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    )
}
