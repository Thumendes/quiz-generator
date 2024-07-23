"use client";

import { X, GripHorizontal, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface QuestionSortableItemProps {
  children: React.ReactNode;
  id: string | number;
}

export function QuestionSortableItem({ children, id }: QuestionSortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-lg border shadow-md flex flex-col bg-background", isDragging && "opacity-50")}
    >
      <div className={cn("flex items-center justify-center py-1 cursor-move")} {...listeners} {...attributes}>
        <GripHorizontal className="size-5 text-muted-foreground" />
      </div>

      <div>{children}</div>
    </div>
  );
}

interface OptionSortableItemProps {
  children: React.ReactNode;
  id: string | number;
}

export function OptionSortableItem({ children, id }: OptionSortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-row bg-background">
      <div className={cn("flex items-center justify-center cursor-move")} {...listeners} {...attributes}>
        <GripVertical className="size-5 text-muted-foreground" />
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
