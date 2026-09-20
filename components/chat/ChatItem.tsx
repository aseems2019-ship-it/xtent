"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: string;
  children: React.ReactNode;
}

export default function ChatItem({
  id,
  children,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
      {...attributes}
    >
      <div className="min-w-0">
        {children}
      </div>

      {/* Drag handle */}
      <div
        {...listeners}
        className="pointer-events-none absolute inset-y-0 left-0 w-1"
        aria-hidden="true"
      />
    </div>
  );
}