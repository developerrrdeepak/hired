'use client';

import { PageHeader } from "@/components/page-header";
import { ChallengeEditor } from "@/components/challenge-editor";
import { useFirebase } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useUserContext } from "@/app/(app)/layout";
import { useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ChallengeSolvePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const { firestore } = useFirebase();
    const { organizationId } = useUserContext(); // Assuming user context has this or we get it from query

    // Fallback if organizationId is not in context (e.g. public challenge)
    const orgId = searchParams.get('orgId') || organizationId || 'org-demo-owner-id';

    const challengeRef = useMemoFirebase(() => {
        if (!firestore || !orgId || !id) return null;
        return doc(firestore, `organizations/${orgId}/challenges`, id);
    }, [firestore, orgId, id]);

    const { data: challenge, isLoading } = useDoc<any>(challengeRef);

    if (isLoading) return <div className="p-8"><Skeleton className="h-12 w-64 mb-4" /><Skeleton className="h-[600px] w-full" /></div>;
    if (!challenge) return <div className="p-8">Challenge not found</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
             <PageHeader 
                title={challenge.title} 
                description={
                    <div className="flex items-center gap-2">
                        <Badge>{challenge.difficulty || 'Medium'}</Badge>
                        <span className="text-muted-foreground text-sm">{challenge.points || 100} Points</span>
                    </div>
                }
            />
            <div className="flex-1 min-h-0">
                <ChallengeEditor 
                    challengeId={id} 
                    initialCode="// Write your solution function here...
function solve(input) {
  // TODO
  return input;
}" 
                />
            </div>
        </div>
    );
}
