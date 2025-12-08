'use client';

import { notFound, useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MapPin, Briefcase, Calendar, Link as LinkIcon, Github, Linkedin, Globe, UserPlus, MessageSquare, Lock } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUserContext } from '@/app/(app)/layout';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { firestore } = useFirebase();
  const { user, role } = useUserContext(); // Use context for role
  const { toast } = useToast();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: profile, isLoading } = useDoc<any>(userRef);

  const handleConnect = async () => {
    if (!firestore || !user || !profile) return;
    
    setIsConnecting(true);
    try {
      await addDoc(collection(firestore, 'connections'), {
        requesterId: user.uid,
        requesterName: user.displayName || 'User',
        requesterRole: 'Recruiter',
        receiverId: profile.id,
        receiverName: profile.displayName || profile.name,
        receiverRole: 'Candidate',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await updateDoc(doc(firestore, 'users', profile.id), {
        notifications: arrayUnion({
          id: `conn-req-${Date.now()}`,
          type: 'connection_request',
          message: `${user.displayName} sent you a connection request`,
          timestamp: new Date().toISOString(),
          read: false,
        })
      });

      toast({
        title: 'Connection request sent',
        description: `Request sent to ${profile.displayName || profile.name}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send connection request',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!firestore || !user || !profile) return;
    
    try {
      const convRef = await addDoc(collection(firestore, 'conversations'), {
        participants: [
          { id: user.uid, name: user.displayName, role: 'Recruiter' },
          { id: profile.id, name: profile.displayName || profile.name, role: 'Candidate' }
        ],
        participantIds: [user.uid, profile.id],
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      router.push(`/messages?convId=${convRef.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start conversation',
      });
    }
  };

  if (isLoading) {
    return <PublicProfileSkeleton />;
  }

  if (!profile) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
        </div>
    )
  }

  // Logic: Owner can always see. Recruiters can always see (if in talent pool). 
  // Private only blocks other candidates or guests.
  // For now, let's allow Recruiters/Owners to see "private" profiles too, or show a restricted view.
  const isViewerOwner = user?.uid === profile.id;
  const isViewerRecruiter = role === 'Recruiter' || role === 'Owner' || role === 'Hiring Manager';
  
  if (profile.profileVisibility === 'private' && !isViewerOwner && !isViewerRecruiter) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Lock className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Private Profile</h2>
            <p className="text-muted-foreground">This user has set their profile to private.</p>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title={profile.displayName || profile.name || 'Candidate Profile'}
        description={profile.currentRole || 'Professional'}
      >
        <div className="flex gap-2">
          {!isViewerOwner && (
              <>
                <Button variant="outline" onClick={handleMessage}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                </Button>
                <Button onClick={handleConnect} disabled={isConnecting}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </>
          )}
          {isViewerOwner && (
              <Button variant="outline" onClick={() => router.push('/profile/edit')}>
                  Edit Profile
              </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="h-24 w-24 border-2">
                  <AvatarImage src={profile.avatarUrl || profile.photoURL} />
                  <AvatarFallback className="text-2xl">
                    {(profile.displayName || profile.name)?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {profile.displayName || profile.name}
                  </h2>
                  <p className="text-muted-foreground mb-3">
                    {profile.currentRole || 'Professional'}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.yearsOfExperience && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {profile.yearsOfExperience} years experience
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <>
                  <Separator className="my-4" />
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experience && profile.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(profile.experience) ? profile.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{exp.title || exp.role}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.startDate || exp.date} - {exp.endDate || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                )) : (
                    <p className="text-sm">{profile.experience}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.education.map((edu: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {profile.projects && profile.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.projects.map((project: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        View Project
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          {(profile.linkedIn || profile.github || profile.portfolio) && (
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.linkedIn && (
                  <a
                    href={profile.linkedIn.startsWith('http') ? profile.linkedIn : `https://${profile.linkedIn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a
                    href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {profile.portfolio && (
                  <a
                    href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resume */}
          {profile.resumeURL && (
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href={profile.resumeURL} target="_blank" rel="noopener noreferrer">
                    Download Resume
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicProfileSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title={<Skeleton className="h-9 w-64" />}
        description={<Skeleton className="h-5 w-48" />}
      >
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6 mb-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
