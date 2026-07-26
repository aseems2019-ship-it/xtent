"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  loading: boolean;
}

export default function ChatInput({
  onSend,
  loading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!message.trim() || loading) return;

    const text = message;
    setMessage("");

    await onSend(text);
  }

  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message XtenT..."
          className="max-h-40 flex-1 resize-none bg-transparent text-white outline-none placeholder:text-zinc-500"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-cyan-500 p-3 text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500">
        Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
}