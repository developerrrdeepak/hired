
'use client';

import { 
  FileText,
  MessageSquare,
  Users,
  User,
  Settings,
  Briefcase,
  Mic,
  GraduationCap,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Link from "next/link";
import { useFirebase } from "@/firebase";
import type { Application, Candidate, Job, Challenge } from '@/lib/definitions';
import { useMemo } from "react";
import { useJobs } from '@/hooks/use-jobs';
import { useChallenges } from '@/hooks/use-challenges';
import { useCandidateProfile } from '@/hooks/use-candidate-profile';
import { useCourses } from '@/hooks/use-courses';
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { placeholderImages } from '@/lib/placeholder-images';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart";

function CircularProgress({ value, label }: { value: number; label: string }) {
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative h-28 w-28">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        className="stroke-current text-background/30"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                        className="stroke-current text-primary"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    {value}%
                </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
    );
}


function ProfileGistCard({ candidate }: { candidate: Candidate | null }) {
    const { user } = useFirebase();
    
    const profileComplete = useMemo(() => {
        if (!candidate) return 10;
        let score = 20;
        if (candidate.currentRole) score += 20;
        if (candidate.phone) score += 20;
        if (candidate.rawResumeText) score += 40;
        return score;
    }, [candidate]);
    
    const skillReadiness = useMemo(() => {
        if (!candidate?.skills) return 10;
        try {
            return Math.min(90, 10 + (candidate.skills?.length || 0) * 8);
        } catch {
            return 10;
        }
    }, [candidate]);

    const careerFit = useMemo(() => {
        if (!candidate) return 15;
        return 75;
    }, [candidate]);

    const userName = user?.displayName || candidate?.name || 'Candidate';
    const imageSrc = user?.photoURL ?? `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`;

    return (
        <Card className="relative overflow-hidden border-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="relative">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome Back!</CardTitle>
                        <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                            <Link href={`/profile/edit`}>
                                Edit Profile
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl">
                                <AvatarImage src={imageSrc} />
                                <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                                    {userName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{userName}</p>
                            <p className="text-muted-foreground">{candidate?.currentRole || 'Professional'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-semibold">Active</span>
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full font-semibold">Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-800">
                            <CircularProgress value={profileComplete} label="Profile Complete" />
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800">
                            <CircularProgress value={skillReadiness} label="Skill Readiness" />
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-800">
                            <CircularProgress value={careerFit} label="Career Fit" />
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

function ActionIconButton({ title, icon: Icon, href, disabled = false, delay, gradient }: { title: string, icon: React.ElementType, href: string, disabled?: boolean, delay: number, gradient: string }) {
    const content = (
        <div className="group relative flex flex-col items-center gap-3 text-center p-4 rounded-2xl border-2 hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-white dark:bg-gray-900">
            <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
            <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="h-8 w-8" />
            </div>
            <span className="text-sm font-bold relative">{title}</span>
        </div>
    );
    
    const wrapperClasses = `animate-in fade-in-0 zoom-in-50 duration-500`;

    if (disabled) {
        return <div className={`${wrapperClasses} cursor-not-allowed opacity-50`} style={{animationDelay: `${delay}ms`}}>{content}</div>
    }

    return (
        <Link href={href} passHref className={wrapperClasses} style={{animationDelay: `${delay}ms`}}>
           {content}
        </Link>
    );
}


export default function CandidateDashboardPage() {
    const { user, isUserLoading } = useFirebase();
    const { candidate, isLoading: isLoadingCandidate } = useCandidateProfile();

    const profileComplete = 75;
    const skillReadiness = 85;
    const careerFit = 80;
    
    const isLoading = isUserLoading || isLoadingCandidate;
    
    const jobTrendsData = [
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 60 },
      { name: 'Mar', value: 75 },
      { name: 'Apr', value: 70 },
      { name: 'May', value: 85 },
      { name: 'Jun', value: 95 },
    ];

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const userName = user?.displayName || candidate?.name || 'Candidate';
    const imageSrc = user?.photoURL ?? `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`;

    return (
    <div className="space-y-8 w-full overflow-hidden">
        <ProfileGistCard candidate={candidate || null} />

        <Card className="relative overflow-hidden border-2 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-400 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/10 dark:via-purple-950/10 dark:to-pink-950/10"></div>
          <div className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                AI-Powered Career Tools
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Supercharge your career with intelligent AI assistants</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionIconButton title="AI Chat" icon={MessageSquare} href="/ai-assistant" delay={100} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
                <ActionIconButton title="Resume AI" icon={FileText} href="/smart-recruiter" delay={200} gradient="bg-gradient-to-br from-purple-500 to-pink-500" />
                <ActionIconButton title="Mock Interview" icon={Mic} href="/voice-interview" delay={300} gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
                <ActionIconButton title="Interview Prep" icon={GraduationCap} href="/interview-prep" delay={400} gradient="bg-gradient-to-br from-orange-500 to-red-500" />
                <ActionIconButton title="Skill Gap" icon={Sparkles} href="/skill-gap" delay={500} gradient="bg-gradient-to-br from-indigo-500 to-purple-500" />
                <ActionIconButton title="Career Path" icon={Briefcase} href="/career-compass" delay={600} gradient="bg-gradient-to-br from-pink-500 to-rose-500" />
                <ActionIconButton title="Fast Match" icon={RefreshCcw} href="/ultra-fast-matching" delay={700} gradient="bg-gradient-to-br from-cyan-500 to-blue-500" />
                <ActionIconButton title="Diversity" icon={Users} href="/diversity-hiring" delay={800} gradient="bg-gradient-to-br from-green-500 to-emerald-500" />
              </div>
            </CardContent>
          </div>
        </Card>

       <Card className="glassmorphism animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-900 border-2 border-primary/20 relative w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                AI-Matched Jobs For You
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                🔄 Real-time updates • Powered by AI matching
              </p>
            </div>
            <Button asChild variant="default" size="sm">
              <Link href="/jobs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AvailableJobsList candidate={candidate} />
          </CardContent>
        </Card>

        <Card className="glassmorphism animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-1000 border-2 border-green-500/20 w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-500/10 to-transparent">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600 animate-bounce" />
                Live Hackathons & Challenges
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                🔄 Real-time updates • Win prizes and boost your profile
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
              <Link href="/challenges">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AvailableChallengesList />
          </CardContent>
        </Card>

       <Card className="glassmorphism animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-1100 border-2 border-blue-500/20 w-full overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Learning Courses
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">NEW</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                🎓 Upskill with employer-provided training
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AvailableCoursesList />
          </CardContent>
        </Card>

       <div className="grid gap-6 md:grid-cols-2">
         <Card className="glassmorphism transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Trending News
            </CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                 <div className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary transition-all cursor-pointer">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl shrink-0">
                      📰
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">AI Transforming Recruitment Industry</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">Companies are adopting AI-powered tools for faster and smarter hiring decisions...</p>
                        <span className="text-xs text-orange-600 font-medium mt-1 inline-block">2 hours ago</span>
                    </div>
                </div>
                 <div className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary transition-all cursor-pointer">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl shrink-0">
                      💼
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Remote Work Trends 2024</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">Latest survey shows 70% of tech companies offering hybrid work models...</p>
                        <span className="text-xs text-blue-600 font-medium mt-1 inline-block">5 hours ago</span>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glassmorphism transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-600">
          <CardHeader>
            <CardTitle>Job Trends</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="font-semibold">Software Engineer</p>
             <div className="h-[120px] w-full mt-2">
                <ChartContainer config={{}} className="h-full w-full">
                    <BarChart data={jobTrendsData} margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}


function AvailableJobsList({ candidate }: { candidate: Candidate | null }) {
    const { jobs, isLoading } = useJobs('Candidate');

    // AI-powered match score calculation
    const jobsWithScores = useMemo(() => {
        if (!jobs || !candidate) return jobs;
        return jobs.map(job => ({
            ...job,
            matchScore: Math.floor(Math.random() * 30) + 70 // Mock AI score 70-100%
        })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }, [jobs, candidate]);

    if (isLoading) return <Skeleton className="h-32 w-full" />;
    if (!jobsWithScores?.length) return (
        <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No jobs available yet</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {jobsWithScores.slice(0, 3).map((job, idx) => (
                <Link 
                    key={job.id} 
                    href={`/jobs/${job.id}`} 
                    className="block p-4 rounded-lg border-2 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-background to-primary/5"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg">{job.title}</h4>
                                {job.matchScore && job.matchScore >= 85 && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">Hot Match!</span>
                                )}
                                <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">Posted by Employer</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{job.department} • {job.location}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">{job.type}</span>
                            {job.matchScore && (
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-1000"
                                            style={{ width: `${job.matchScore}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-primary">{job.matchScore}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>💰 {job.salaryRange || 'Competitive'}</span>
                        <span>•</span>
                        <span>📍 {job.location}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function AvailableCoursesList() {
    const { courses, isLoading } = useCourses();

    if (isLoading) return <Skeleton className="h-32 w-full" />;
    if (!courses?.length) return (
        <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No courses available</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {courses.slice(0, 3).map((course: any) => (
                <Link 
                    key={course.id} 
                    href="/courses" 
                    className="block p-4 rounded-lg border-2 border-blue-500/20 hover:border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-background to-blue-500/5"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg">{course.title}</h4>
                                <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">{course.level}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>🕒 {course.duration}</span>
                        <span>•</span>
                        <span>🎯 {course.instructor}</span>
                        <span>•</span>
                        <span>👥 {course.enrollments || 0} enrolled</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function AvailableChallengesList() {
    const { challenges, isLoading } = useChallenges();

    const prizes = ['🏆 $5,000', '💰 $3,000', '🎁 $1,000'];

    if (isLoading) return <Skeleton className="h-32 w-full" />;
    if (!challenges?.length) return (
        <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No active challenges</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {challenges.slice(0, 3).map((challenge, idx) => (
                <Link 
                    key={challenge.id} 
                    href={`/challenges/${challenge.id}?role=Candidate&orgId=${challenge.organizationId}`} 
                    className="block p-4 rounded-lg border-2 border-green-500/20 hover:border-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-background to-green-500/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg">{challenge.title}</h4>
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                                    <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded">By Employer</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{challenge.difficulty} • {challenge.type}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-lg font-bold text-green-600">{prizes[idx] || '🎁 Prize'}</span>
                                <span className="text-xs text-muted-foreground">Prize Pool</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {Math.floor(Math.random() * 500) + 100} participants
                                </span>
                                <span className="flex items-center gap-1 text-orange-600 font-semibold">
                                    ⏱️ {Math.floor(Math.random() * 10) + 1} days left
                                </span>
                            </div>
                            <Button size="sm" variant="outline" className="h-6 text-xs border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                                Join Now
                            </Button>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
        <Skeleton className="h-64 w-full" />
        <div className="flex items-center justify-around">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    </div>
  )
}
