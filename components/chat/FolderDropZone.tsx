"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: string;
  children: React.ReactNode;
}

export default function FolderDropZone({
  id,
  children,
}: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition ${
        isOver
          ? "bg-cyan-500/20 border border-cyan-500"
          : ""
      }`}
    >
      {children}
    </div>
  );
}