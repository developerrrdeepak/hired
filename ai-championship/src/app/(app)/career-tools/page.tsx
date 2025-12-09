'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEdit, Brain, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'Resume Builder',
    description: 'AI-powered resume creation and optimization',
    icon: FileEdit,
    href: '/resume-builder',
  },
  {
    title: 'Negotiation Practice',
    description: 'Practice salary and offer negotiations',
    icon: Brain,
    href: '/negotiation-practice',
  },
  {
    title: 'Job Recommendations',
    description: 'AI-matched job opportunities',
    icon: Briefcase,
    href: '/job-recommendations',
  },
  {
    title: 'Career Compass',
    description: 'Get personalized career guidance',
    icon: TrendingUp,
    href: '/ai-assistant',
  },
];

export default function CareerToolsPage() {
  return (
    <>
      <PageHeader
        title="Career Tools"
        description="Advance your career with AI-powered tools"
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
                <Link href={tool.href}>Open Tool</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
