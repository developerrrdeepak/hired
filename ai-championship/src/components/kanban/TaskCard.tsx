import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task } from "./types";
import { cva } from "class-variance-authority";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab hover:ring-2 hover:ring-primary/50 relative task ${
        isDragging ? "opacity-30 ring-2 ring-primary" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={task.avatar} />
                    <AvatarFallback>{task.candidateName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold truncate max-w-[100px]">{task.candidateName}</span>
            </div>
            {task.fitScore > 0 && (
                <Badge variant={task.fitScore > 80 ? "default" : "secondary"} className="text-[10px] h-5 px-1">
                    {task.fitScore}% Match
                </Badge>
            )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.jobTitle}
        </p>
      </CardContent>
    </Card>
  );
}
