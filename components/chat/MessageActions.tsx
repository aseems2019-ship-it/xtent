"use client";

import {
  Copy,
  Check,
  Pencil,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { useState } from "react";

interface Props {
  role: "user" | "assistant";
  text: string;

  onEdit?: () => void;
  onRegenerate?: () => void;
}

export default function MessageActions({
  role,
  text,
  onEdit,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 flex items-center gap-2 opacity-70 transition hover:opacity-100">

      <button onClick={copy}>
        {copied ? (
          <Check size={16} />
        ) : (
          <Copy size={16} />
        )}
      </button>

      {role === "user" && onEdit && (
        <button onClick={onEdit}>
          <Pencil size={16} />
        </button>
      )}

      {role === "assistant" && (
        <>
          <button>
            <ThumbsUp size={16} />
          </button>

          <button>
            <ThumbsDown size={16} />
          </button>

          {onRegenerate && (
            <button onClick={onRegenerate}>
              <RotateCcw size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
}