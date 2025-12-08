'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, MoreVertical, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import type { Challenge } from '@/lib/definitions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ChallengeCardProps {
  challenge: Challenge;
  showJoinButton?: boolean;
  delay?: number;
}

export function ChallengeCard({ challenge, showJoinButton = true, delay = 0 }: ChallengeCardProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const isExpired = new Date(challenge.deadline) < new Date();

  const handleDelete = async () => {
    if (!firestore || !confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      await deleteDoc(doc(firestore, `organizations/${challenge.organizationId}/challenges`, challenge.id));
      toast({ title: 'Challenge deleted successfully' });
      router.refresh();
    } catch (error) {
      toast({ title: 'Failed to delete challenge', variant: 'destructive' });
    }
  };
  
  return (
    <Card 
      className="flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 glassmorphism animate-in fade-in-0 slide-in-from-top-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold hover:text-primary cursor-pointer truncate">
              <Link href={`/challenges/${challenge.id}?orgId=${challenge.organizationId}`}>
                {challenge.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm mt-1 line-clamp-2">
              {challenge.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={isExpired ? 'secondary' : 'default'}>
              {challenge.type}
            </Badge>
            {!showJoinButton && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/challenges/${challenge.id}/edit?orgId=${challenge.organizationId}`} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-2 text-sm p-5 pt-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-4 w-4 shrink-0" />
          <span className="truncate font-medium text-foreground">{challenge.reward}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Deadline: {new Date(challenge.deadline).toLocaleDateString()}
          </span>
        </div>

        {isExpired && (
          <Badge variant="destructive" className="w-full justify-center">
            Expired
          </Badge>
        )}
      </CardContent>
      
      {showJoinButton && !isExpired && (
        <CardFooter className="p-5 pt-0">
          <Button className="w-full" asChild>
            <Link href={`/challenges/${challenge.id}?orgId=${challenge.organizationId}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
