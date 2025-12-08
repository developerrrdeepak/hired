'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Briefcase, Users, Trophy, MessageCircle, Settings, LayoutDashboard } from 'lucide-react';
import { useUserContext } from '@/app/(app)/layout';

const commands = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/candidate-portal/dashboard' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { id: 'candidates', label: 'Candidates', icon: Users, href: '/candidates' },
  { id: 'challenges', label: 'Challenges', icon: Trophy, href: '/challenges' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/messages' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { role } = useUserContext();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(`${href}?role=${role}`);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-xl">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => handleSelect(cmd.href)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <cmd.icon className="h-4 w-4" />
              {cmd.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
