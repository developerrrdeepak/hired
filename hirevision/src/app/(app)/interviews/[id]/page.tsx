'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, User, Edit, MessageSquare, Video, Phone } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Interview } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserContext } from '../../layout';

export default function InterviewDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { firestore } = useFirebase();
  const { organizationId, isUserLoading } = useUserContext();

  const interviewRef = useMemoFirebase(() => {
    if (!firestore || !organizationId || !id) return null;
    return doc(firestore, `organizations/${organizationId}/interviews`, id);
  }, [firestore, organizationId, id]);

  const { data: interview, isLoading: isInterviewLoading } = useDoc<Interview>(interviewRef);

  const isLoading = isUserLoading || isInterviewLoading;

  if (isLoading) {
    return <InterviewDetailSkeleton />;
  }

  if (!interview) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'no_show':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Phone Screen':
        return <Phone className="h-4 w-4" />;
      case 'Technical':
        return <Video className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title={`${interview.type} Interview`}
        description={`Scheduled for ${new Date(interview.scheduledAt).toLocaleString()}`}
      >
        <div className="flex gap-2">
          {interview.status === 'scheduled' && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/interviews/${id}/feedback`}>
                  Add Feedback
                </Link>
              </Button>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Reschedule
              </Button>
            </>
          )}
          {interview.status === 'completed' && (
            <Button asChild>
              <Link href={`/interviews/${id}/feedback`}>
                View Feedback
              </Link>
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(interview.type)}
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{interview.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {new Date(interview.scheduledAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{interview.durationMinutes} minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium truncate">{interview.locationOrLink}</p>
                  </div>
                </div>
              </div>

              {interview.locationOrLink.startsWith('http') && (
                <>
                  <Separator />
                  <Button asChild className="w-full">
                    <a href={interview.locationOrLink} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Join Interview
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          {interview.interviewerFeedback && interview.interviewerFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interviewer Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {interview.interviewerFeedback.map((feedback, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {feedback.interviewerName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{feedback.interviewerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(feedback.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        feedback.verdict === 'Strong Hire' ? 'default' :
                        feedback.verdict === 'Hire' ? 'secondary' :
                        feedback.verdict === 'No Hire' ? 'outline' :
                        'destructive'
                      }>
                        {feedback.verdict}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < feedback.rating ? 'text-amber-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Pros:</p>
                      <p className="text-sm text-muted-foreground">{feedback.pros}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Cons:</p>
                      <p className="text-sm text-muted-foreground">{feedback.cons}</p>
                    </div>

                    {idx < interview.interviewerFeedback!.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Interviewers */}
          <Card>
            <CardHeader>
              <CardTitle>Interviewers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {interview.interviewerIds && interview.interviewerIds.length > 0 ? (
                interview.interviewerIds.map((interviewerId) => (
                  <div key={interviewerId} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Interviewer</p>
                      <p className="text-xs text-muted-foreground">{interviewerId}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No interviewers assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/applications/${interview.applicationId}`}>
                  View Application
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Send Reminder
              </Button>
              {interview.status === 'scheduled' && (
                <Button variant="destructive" className="w-full justify-start">
                  Cancel Interview
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InterviewDetailSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title={<Skeleton className="h-9 w-64" />}
        description={<Skeleton className="h-5 w-48" />}
      >
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interviewers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
