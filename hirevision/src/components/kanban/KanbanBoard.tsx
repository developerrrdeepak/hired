'use client';

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { ColumnContainer } from "./ColumnContainer";
import { TaskCard } from "./TaskCard";
import type { Column, Task, ColumnId } from "./types";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useUserContext } from "@/app/(app)/layout";
import { useToast } from "@/hooks/use-toast";
import type { Application, Candidate, Job } from '@/lib/definitions';
import { placeholderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";

const defaultColumns: Column[] = [
    { id: 'Applied', title: 'Applied' },
    { id: 'Screening', title: 'Screening' },
    { id: 'Technical Interview', title: 'Technical Interview' },
    { id: 'HR Interview', title: 'HR Interview' },
    { id: 'Offer', title: 'Offer' },
    { id: 'Hired', title: 'Hired' },
    { id: 'Rejected', title: 'Rejected' },
];

export function KanbanBoard() {
  const { firestore } = useFirebase();
  const { organizationId } = useUserContext();
  const { toast } = useToast();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // --- Data Fetching ---
  const applicationsQuery = useMemoFirebase(() => {
    if (!firestore || !organizationId) return null;
    return query(collection(firestore, `organizations/${organizationId}/applications`));
  }, [firestore, organizationId]);

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore || !organizationId) return null;
    return query(collection(firestore, `organizations/${organizationId}/candidates`));
  }, [firestore, organizationId]);

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore || !organizationId) return null;
    return query(collection(firestore, `organizations/${organizationId}/jobs`));
  }, [firestore, organizationId]);

  const { data: applications, isLoading: isLoadingApps } = useCollection<Application>(applicationsQuery);
  const { data: candidates } = useCollection<Candidate>(candidatesQuery);
  const { data: jobs } = useCollection<Job>(jobsQuery);

  const tasks: Task[] = useMemo(() => {
    if (!applications || !candidates || !jobs) return [];
    
    const candidatesMap = new Map(candidates.map(c => [c.id, c]));
    const jobsMap = new Map(jobs.map(j => [j.id, j]));

    return applications.map(app => {
         const candidate = candidatesMap.get(app.candidateId);
         const job = jobsMap.get(app.jobId);
         return {
            id: app.id,
            columnId: app.stage as ColumnId,
            content: app.stage,
            candidateName: candidate?.name || 'Unknown',
            jobTitle: job?.title || 'Unknown Role',
            fitScore: app.fitScore || 0,
            avatar: candidate?.photoUrl || undefined // Fix: Use real photo or undefined for fallback
         };
    });
  }, [applications, candidates, jobs]);

  const columnsId = useMemo(() => defaultColumns.map((col) => col.id), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";
    const isOverTask = over.data.current?.type === "Task";

    if (isActiveTask && (isOverColumn || isOverTask)) {
        // Find new column
        let newColumnId: ColumnId;
        if (isOverColumn) {
            newColumnId = overId as ColumnId;
        } else {
             newColumnId = over.data.current?.task.columnId;
        }

        const task = tasks.find(t => t.id === activeId);
        if (task && task.columnId !== newColumnId) {
             // Optimistic update handled by local state re-render from props? 
             // Actually, we need to update Firestore.
             updateApplicationStage(activeId as string, newColumnId);
        }
    }
  }
  
  const updateApplicationStage = async (appId: string, newStage: ColumnId) => {
    if (!firestore || !organizationId) return;
    try {
        const appRef = doc(firestore, `organizations/${organizationId}/applications`, appId);
        
        let status = 'in-progress';
        if (newStage === 'Hired') status = 'hired';
        if (newStage === 'Rejected') status = 'rejected';
        if (newStage === 'Offer') status = 'offer';

        await updateDoc(appRef, { 
            stage: newStage, 
            status: status,
            updatedAt: new Date().toISOString() 
        });

        toast({ title: "Updated", description: `Application moved to ${newStage}` });
        
        // --- Productivity Automation: Auto-Email Trigger ---
        if (newStage === 'Offer' || newStage === 'Rejected' || newStage === 'Technical Interview') {
           triggerAutomatedEmail(appId, newStage);
        }

    } catch (error) {
        console.error("Failed to update stage", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to move application" });
    }
  };

  const triggerAutomatedEmail = async (appId: string, stage: string) => {
      try {
           // We would fetch candidate and job details here if not available in closure
           // But simpler to let the API handle it if we passed IDs. 
           // For now, let's just use the AI Assistant API to generate a draft and maybe log it.
           // In a real app, this would likely call a specific 'automation' endpoint.
           
           // Finding task details for context
           const task = tasks.find(t => t.id === appId);
           if (!task) return;

           const response = await fetch('/api/ai-assistant', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   action: 'generate-email',
                   topic: `Application update: moved to ${stage} stage`,
                   recipient: task.candidateName,
                   tone: 'professional'
               })
           });
           
           if (response.ok) {
               const data = await response.json();
               toast({ 
                   title: "AI Automation", 
                   description: `Draft email generated for ${task.candidateName} (${stage})`,
                   // In a real app, we might open a modal with this draft
               });
               console.log("Generated Draft:", data.data.answer);
           }
      } catch (e) {
          console.error("Automation error", e);
      }
  }

  if (isLoadingApps) return <div className="flex gap-4 p-4 overflow-x-auto"><Skeleton className="w-[280px] h-[500px]" /><Skeleton className="w-[280px] h-[500px]" /><Skeleton className="w-[280px] h-[500px]" /></div>;

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto p-4 pb-8">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex gap-4">
          {defaultColumns.map((col) => (
            <ColumnContainer
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.columnId === col.id)}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}


