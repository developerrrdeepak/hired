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
  MessageCircle
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
        { href: '/diversity-hiring', icon: Heart, label: 'Diversity' },
      ]
    },
    {
       title: 'Intelligence',
       items: [
        { href: '/ai-hub', icon: Sparkles, label: 'AI Hub' },
        { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
       ]
    },
    {
       title: 'Network',
       items: [
        { href: '/community', icon: Users, label: 'Community' },
        { href: '/connections', icon: UserPlus, label: 'Connections' },
        { href: '/messages', icon: MessageCircle, label: 'Messages' },
       ]
    },
    {
        title: 'Settings',
        items: [
            { href: '/analytics', icon: BarChart3, label: 'Analytics' },
            { href: '/reports', icon: LineChart, label: 'Reports' },
            { href: '/billing', icon: CreditCard, label: 'Billing' },
            { href: '/settings', icon: Settings, label: 'Settings' },
        ]
    }
  ],
  'Recruiter': [
    {
      title: 'Recruitment',
      items: [
        { href: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/jobs', icon: Briefcase, label: 'Jobs'},
        { href: '/candidates', icon: Users, label: 'Candidates' },
        { href: '/diversity-hiring', icon: Heart, label: 'Diversity' },
      ]
    },
    {
        title: 'Intelligence',
        items: [
            { href: '/ai-hub', icon: Sparkles, label: 'AI Hub' },
            { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
        ]
    },
    {
       title: 'Network',
       items: [
        { href: '/community', icon: Users, label: 'Community' },
        { href: '/connections', icon: UserPlus, label: 'Connections' },
        { href: '/messages', icon: MessageCircle, label: 'Messages' },
       ]
    },
    {
      items: [
        { href: '/reports', icon: LineChart, label: 'Reports' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ],
  'Hiring Manager': [
    {
      items: [
        { href: '/hiring-manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/jobs', icon: Briefcase, label: 'My Jobs' },
        { href: '/candidates', icon: Users, label: 'Talent Pool' },
        { href: '/interviews', icon: List, label: 'Interviews' },
        { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
      ]
    }
  ],
  'Interviewer': [
    {
      items: [
        { href: '/interviews', icon: List, label: 'My Interviews' },
      ]
    }
  ],
  'Candidate': [
    {
        title: 'Career',
        items: [
            { href: '/candidate-portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/jobs', icon: Briefcase, label: 'Jobs' },
             { href: '/challenges', icon: Trophy, label: 'Challenges' },
        ]
    },
    {
        title: 'Growth',
        items: [
             { href: '/courses', icon: GraduationCap, label: 'Courses' },
             { href: '/ai-hub', icon: Sparkles, label: 'AI Hub' },
             { href: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
             { href: '/negotiation-practice', icon: Brain, label: 'Negotiation Practice' },
        ]
    },
    {
       title: 'Community',
       items: [
            { href: '/community', icon: Users, label: 'Community' },
            { href: '/connections', icon: UserPlus, label: 'Connections' },
            { href: '/messages', icon: MessageCircle, label: 'Messages' },
       ]
    },
    {
        items: [
            { href: '/profile/edit', icon: User, label: 'Profile' },
            { href: '/settings', icon: Settings, label: 'Settings' },
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
    <SidebarMenu>
      {navSections.map((section, index) => (
        <SidebarGroup key={index} className={index > 0 ? 'mt-4' : ''}>
            {section.title && (
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                    {section.title}
                </div>
            )}
            {section.items.map(item => (
                 <SidebarMenuItem key={item.href}>
                    <NavItem item={item} />
                </SidebarMenuItem>
            ))}
        </SidebarGroup>
      ))}
    </SidebarMenu>
  );
}
