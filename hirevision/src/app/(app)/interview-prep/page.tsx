'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Video, FileText, Brain, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useUserContext } from '../layout';

const candidateTools = [
  {
    title: 'Voice Interview',
    description: 'Practice with AI voice interviewer',
    icon: Mic,
    href: '/voice-interview',
  },
  {
    title: 'Video Interview',
    description: 'Real-time video interviews with AI analysis',
    icon: Video,
    href: '/video-interview',
  },
  {
    title: 'Skill Assessment',
    description: 'AI-powered skill evaluation',
    icon: FileText,
    href: '/interviews',
  },
  {
    title: 'Negotiation Practice',
    description: 'Practice salary negotiations',
    icon: Brain,
    href: '/negotiation-practice',
  },
];

const employerTools = [
  {
    title: 'Video Interview',
    description: 'Conduct live video interviews with candidates',
    icon: Video,
    href: '/video-interview',
  },
  {
    title: 'Voice Interview',
    description: 'Conduct voice interviews with AI analysis',
    icon: Mic,
    href: '/voice-interview',
  },
  {
    title: 'Interview Management',
    description: 'Schedule and manage candidate interviews',
    icon: Users,
    href: '/interviews',
  },
  {
    title: 'AI Assistant',
    description: 'Get AI-powered interview questions and insights',
    icon: MessageSquare,
    href: '/ai-assistant',
  },
];

export default function InterviewPrepPage() {
  const { role } = useUserContext();
  const isCandidate = role === 'Candidate';
  const tools = isCandidate ? candidateTools : employerTools;
  
  return (
    <>
      <PageHeader
        title="Interview Tools"
        description={isCandidate ? 'Prepare for your interviews with AI-powered tools' : 'Conduct and manage interviews with AI-powered tools'}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {tools.map((tool) => (
          <Card key={tool.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{tool.title}</CardTitle>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={tool.href}>{isCandidate ? 'Start Practice' : 'Open Tool'}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}


