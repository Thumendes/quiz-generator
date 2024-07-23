import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

interface SortableRootProps {
  children: React.ReactNode;
  ids: (string | number)[];
  onMove?: (oldIndex: number, newIndex: number) => void;
  overlay?: (id: string | number) => React.ReactNode;
}

export function SortableRoot({ children, ids, overlay, onMove }: SortableRootProps) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);

      onMove?.(oldIndex, newIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>

      {overlay && <DragOverlay>{activeId ? overlay(activeId) : null}</DragOverlay>}
    </DndContext>
  );
}
