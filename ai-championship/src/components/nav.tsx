'use client';

import {
  Briefcase,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  LineChart,
  Mail,
  List,
  UserCog,
  GraduationCap,
  Trophy,
  BarChart3,
  User,
  MessageSquare,
  Building,
  Zap,
  CreditCard,
  Cloud,
  Bot,
  Mic,
  Brain,
  Rocket,
  Heart,
  Sparkles,
  UserPlus,
  MessageCircle,
  KanbanSquare,
  FileEdit,
  CheckCircle2,
  BrainCircuit,
  Search,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { useFirebase } from '@/firebase';
import { useUserContext } from '@/app/(app)/layout';

type NavItem = {
    href: string;
    icon: React.ElementType;
    label: string;
    exact?: boolean;
};

type NavSection = {
    title?: string; // Optional section title
    items: NavItem[];
};

const navConfig: Record<string, NavSection[]> = {
  'Owner': [
    {
      title: 'Platform',
      items: [
        { href: '/founder/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/jobs', icon: Briefcase, label: 'Jobs'}, 
        { href: '/candidates', icon: Users, label: 'Candidates' },
        { href: '/challenges', icon: Trophy, label: 'Challenges' },
      ]
    },
    {
       title: 'AI Suite',
       items: [
        { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
        { href: '/sourcing', icon: Search, label: 'Smart Sourcing' },
        { href: '/interview-prep', icon: Mic, label: 'Interview Tools' },
        { href: '/onboarding', icon: Rocket, label: 'Onboarding AI' },
        { href: '/reference-check', icon: CheckCircle2, label: 'Reference AI' },
        { href: '/salary-insights', icon: DollarSign, label: 'Salary Insights' },
        { href: '/analytics', icon: BarChart3, label: 'Analytics' },
       ]
    },
    {
       title: 'Community',
       items: [
        { href: '/community', icon: Users, label: 'Community' },
        { href: '/messages', icon: MessageCircle, label: 'Messages' },
       ]
    },
    {
        title: 'Account',
        items: [
            { href: '/profile/edit', icon: User, label: 'Profile' },
            { href: '/billing', icon: CreditCard, label: 'Billing' },
        ]
    }
  ],
  'Recruiter': [
    {
      title: 'Platform',
      items: [
        { href: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/jobs', icon: Briefcase, label: 'Jobs'},
        { href: '/candidates', icon: Users, label: 'Candidates' },
        { href: '/challenges', icon: Trophy, label: 'Challenges' },
      ]
    },
    {
        title: 'AI Suite',
        items: [
            { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
            { href: '/sourcing', icon: Search, label: 'Smart Sourcing' },
            { href: '/interview-prep', icon: Mic, label: 'Interview Tools' },
            { href: '/onboarding', icon: Rocket, label: 'Onboarding AI' },
            { href: '/reference-check', icon: CheckCircle2, label: 'Reference AI' },
            { href: '/salary-insights', icon: DollarSign, label: 'Salary Insights' },
            { href: '/analytics', icon: BarChart3, label: 'Analytics' },
        ]
    },
    {
       title: 'Community',
       items: [
        { href: '/community', icon: Users, label: 'Community' },
        { href: '/messages', icon: MessageCircle, label: 'Messages' },
       ]
    },
    {
        title: 'Account',
        items: [
            { href: '/profile/edit', icon: User, label: 'Profile' },
        ]
    }
  ],
  'Hiring Manager': [
    {
      title: 'Platform',
      items: [
        { href: '/hiring-manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/jobs', icon: Briefcase, label: 'Jobs' },
        { href: '/candidates', icon: Users, label: 'Candidates' },
      ]
    },
    {
      title: 'AI Suite',
      items: [
        { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
        { href: '/interview-prep', icon: Mic, label: 'Interview Tools' },
        { href: '/onboarding', icon: Rocket, label: 'Onboarding AI' },
        { href: '/salary-insights', icon: DollarSign, label: 'Salary Insights' },
      ]
    },
    {
      title: 'Account',
      items: [
        { href: '/profile/edit', icon: User, label: 'Profile' },
      ]
    }
  ],
  'Interviewer': [
    {
      title: 'Platform',
      items: [
        { href: '/interviews', icon: List, label: 'Interviews' },
      ]
    },
    {
      title: 'Account',
      items: [
        { href: '/profile/edit', icon: User, label: 'Profile' },
      ]
    }
  ],
  'Candidate': [
    {
        title: 'Platform',
        items: [
            { href: '/candidate-portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/jobs', icon: Briefcase, label: 'Jobs' },
            { href: '/challenges', icon: Trophy, label: 'Challenges' },
            { href: '/courses', icon: GraduationCap, label: 'Courses' },
        ]
    },
    {
        title: 'AI Suite',
        items: [
             { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
             { href: '/resume-builder', icon: FileEdit, label: 'Resume Builder' },
             { href: '/interview-prep', icon: Mic, label: 'Interview Tools' },
             { href: '/skill-gap', icon: BrainCircuit, label: 'Skill Gap Analysis' },
             { href: '/salary-insights', icon: DollarSign, label: 'Salary Insights' },
             { href: '/career-tools', icon: Brain, label: 'Career Tools' },
        ]
    },
    {
       title: 'Community',
       items: [
            { href: '/community', icon: Users, label: 'Community' },
            { href: '/messages', icon: MessageCircle, label: 'Messages' },
       ]
    },
    {
        title: 'Account',
        items: [
            { href: '/profile/edit', icon: User, label: 'Profile' },
        ]
    }
  ],
};


function NavItem({ item }: { item: NavItem }) {
    const pathname = usePathname();
    const { user, role, organizationId } = useUserContext();
    
    const linkHref = `${item.href}?role=${role}`;

    let isActive;
    if (item.exact) {
        isActive = pathname === item.href;
    } else {
        isActive = pathname.startsWith(item.href);
    }
    
    if (item.href === '/settings' && (pathname === '/settings' || pathname.startsWith('/settings/'))) {
        isActive = true;
    }

    if (item.href === '/emails' && (pathname === '/emails' || pathname.startsWith('/emails/'))) {
        isActive = true;
    }

    if (item.href === '/organization') {
        if (!organizationId) return null;
        const orgPath = `/organization/${organizationId}`;
        isActive = pathname === orgPath;
        return (
            <Link href={`${orgPath}?role=${role}`} passHref legacyBehavior>
                 <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                >
                    <a href={`${orgPath}?role=${role}`}>
                        <item.icon />
                        <span>{item.label}</span>
                    </a>
                </SidebarMenuButton>
            </Link>
        )
    }



    return (
        <Link href={linkHref} passHref legacyBehavior>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.label}
            >
                 <a href={linkHref}>
                    <item.icon />
                    <span>{item.label}</span>
                </a>
            </SidebarMenuButton>
        </Link>
    );
}

export function Nav({ role }: { role: string | null }) {
  const { isUserLoading } = useUserContext();
  
  const navSections = role ? navConfig[role as keyof typeof navConfig] || [] : [];

  if(!role || isUserLoading) {
      return null;
  };

  return (
    <SidebarMenu className="h-full">
      {navSections.map((section, index) => (
        <SidebarGroup key={index} className={index > 0 ? 'mt-3' : ''}>
            {section.title && (
                <div className="px-3 py-1 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                    {section.title}
                </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                  <SidebarMenuItem key={item.href}>
                      <NavItem item={item} />
                  </SidebarMenuItem>
              ))}
            </div>
        </SidebarGroup>
      ))}
    </SidebarMenu>
  );
}
