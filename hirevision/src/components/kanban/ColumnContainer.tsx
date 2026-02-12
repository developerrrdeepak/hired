import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Task, ColumnId } from "./types";
import { TaskCard } from "./TaskCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnContainerProps {
  column: { id: ColumnId; title: string };
  tasks: Task[];
}

export function ColumnContainer({ column, tasks }: ColumnContainerProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <Card 
        ref={setNodeRef}
        className="w-[280px] min-w-[280px] bg-secondary/20 flex flex-col h-[600px] max-h-[600px]"
    >
      <CardHeader className="p-3 border-b bg-background/50 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
                {column.title}
            </CardTitle>
            <div className="flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold h-5 w-5 rounded-full">
                {tasks.length}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 overflow-hidden">
        <ScrollArea className="h-full pr-3">
            <div className="flex flex-col gap-2">
                <SortableContext items={tasksIds}>
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
                </SortableContext>
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


