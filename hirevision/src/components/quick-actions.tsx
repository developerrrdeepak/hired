'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, Trophy, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { useUserContext } from '@/app/(app)/layout';
import { cn } from '@/lib/utils';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useUserContext();

  const actions = role === 'Candidate' ? [
    { icon: Briefcase, label: 'Browse Jobs', href: '/jobs' },
    { icon: Trophy, label: 'Challenges', href: '/challenges' },
    { icon: FileText, label: 'Resume', href: '/resume-builder' },
  ] : [
    { icon: Briefcase, label: 'New Job', href: '/jobs/new' },
    { icon: Users, label: 'New Candidate', href: '/candidates/new' },
    { icon: Trophy, label: 'New Challenge', href: '/challenges/new' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={cn(
        "flex flex-col-reverse gap-3 mb-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, idx) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 bg-background border shadow-lg rounded-full px-4 py-2 hover:bg-accent transition-all hover:scale-105"
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            <action.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
      
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}


