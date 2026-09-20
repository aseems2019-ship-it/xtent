"use client";

import { useState } from "react";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  children: React.ReactNode;
}

export default function DropZone({
  onFileDrop,
  children,
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false);

  function prevent(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    prevent(e);

    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      onFileDrop(file);
    }
  }

  return (
    <div
      onDragEnter={() => setDragging(true)}
      onDragOver={prevent}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="relative h-full"
    >
      {children}

      {dragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-cyan-400 bg-black/80">
          <div className="text-center">
            <div className="text-3xl">📂</div>
            <p className="mt-2 text-lg font-medium text-white">
              Drop your file here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}