"use client";

import { PROMPTS } from "@/lib/prompts";

interface Props {
  onSelect: (text: string) => void;
}

export default function PromptLibrary({
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROMPTS.map((item) => (
        <button
          key={item.title}
          onClick={() => onSelect(item.prompt)}
          className="rounded-xl border border-zinc-700 p-3 text-left hover:bg-zinc-800"
        >
          <h3 className="font-semibold">
            {item.title}
          </h3>

          <p className="mt-2 text-xs text-zinc-500">
            {item.prompt}
          </p>
        </button>
      ))}
    </div>
  );
}