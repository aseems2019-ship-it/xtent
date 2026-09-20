"use client";

import { X } from "lucide-react";

interface Props {
  image: string;
  onRemove: () => void;
}

export default function ImagePreview({
  image,
  onRemove,
}: Props) {
  return (
    <div className="relative inline-block">
      <img
        src={image}
        alt="Preview"
        className="h-28 w-28 rounded-xl border border-zinc-700 object-cover"
      />

      <button
        onClick={onRemove}
        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}