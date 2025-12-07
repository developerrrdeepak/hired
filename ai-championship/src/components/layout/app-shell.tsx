'use client';

import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarTrigger,
    SidebarInset
} from '@/components/ui/sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Notifications } from '@/components/notifications';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { HireVisionLogo } from '@/components/icons';
import type { Organization } from '@/lib/definitions';
import Image from 'next/image';
import { UserNav } from '../user-nav';
import { Separator } from '@/components/ui/separator';

interface AppShellProps {
    children: React.ReactNode;
    nav: React.ReactNode;
    homePath: string;
    organization: Organization | null;
}

function AppShellContent({ children, nav, homePath, organization }: AppShellProps) {
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                     <div className="flex items-center justify-between px-2 pt-2">
                         <Link
                            href={homePath}
                            className="flex items-center gap-2 truncate font-semibold"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                 {organization?.logoUrl ? (
                                    <Image src={organization.logoUrl} alt={`${organization.name} Logo`} width={24} height={24} className="rounded-md object-contain" />
                                ) : (
                                    <HireVisionLogo className="h-5 w-5" />
                                )}
                            </div>
                            <span className="truncate font-bold group-data-[collapsible=icon]:hidden">
                                {organization?.name || 'HireVision'}
                            </span>
                        </Link>
                    </div>
                </SidebarHeader>
                
                <SidebarContent>
                  {nav}
                </SidebarContent>

                <SidebarFooter>
                     <UserNav />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                     <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumbs />
                     </div>
                     <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/ai-assistant">
                                <MessageSquare className="h-5 w-5" />
                                <span className="sr-only">AI Chat</span>
                            </Link>
                        </Button>
                        <ThemeToggle />
                        <Notifications />
                     </div>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export function AppShell(props: AppShellProps) {
    return (
        <AppShellContent {...props} />
    );
}
