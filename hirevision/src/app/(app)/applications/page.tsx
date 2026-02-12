'use client';

import { PageHeader } from '@/components/page-header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutList, Kanban as KanbanIcon } from 'lucide-react';
import ApplicationsTable from './table-view'; // We'll move the old default export here
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function ApplicationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'kanban'; // Default to kanban

  const setView = (v: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', v);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <PageHeader
        title="Applications"
        description="Track and manage all candidate applications."
      >
         <Tabs value={view} onValueChange={setView} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="kanban"><KanbanIcon className="w-4 h-4 mr-2" /> Board</TabsTrigger>
                <TabsTrigger value="table"><LayoutList className="w-4 h-4 mr-2" /> List</TabsTrigger>
            </TabsList>
         </Tabs>
      </PageHeader>
      
      {view === 'kanban' ? (
        <div className="h-[calc(100vh-200px)]">
            <KanbanBoard />
        </div>
      ) : (
        <ApplicationsTable />
      )}
    </>
  );
}


