
'use client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { placeholderImages } from "@/lib/placeholder-images";
import { signOut } from "firebase/auth";
import { LogOut, ChevronsUpDown, Sparkles, User, Settings, CreditCard } from "lucide-react";
import { useUserContext } from "@/app/(app)/layout";
import { SidebarMenuButton } from "./ui/sidebar";

export function UserNav() {
  const { auth } = useFirebase();
  const { user } = useUserContext();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
        try {
            await signOut(auth);
            localStorage.clear();
            await fetch('/api/auth/logout');
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    } else {
        localStorage.clear();
        await fetch('/api/auth/logout');
        router.push('/login');
    }
  };
  
  if (!user) {
    return (
        <Button variant="outline" onClick={() => router.push('/login')} className="w-full justify-start">
             <User className="mr-2 h-4 w-4" />
             Login
        </Button>
    )
  };

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  // Fix: Use user.avatarUrl if exists, otherwise undefined to let AvatarFallback render
  const avatarUrl = user.avatarUrl;

  return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs">{user.email}</span>
                    </div>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                     <Sparkles className="mr-2 h-4 w-4" />
                     Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                     <User className="mr-2 h-4 w-4" />
                     Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/billing')}>
                     <CreditCard className="mr-2 h-4 w-4" />
                     Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                     <Settings className="mr-2 h-4 w-4" />
                     Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
  )
}
