"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import ConversationSidebar from "@/components/chat/ConversationSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  const [historyOpen, setHistoryOpen] = useState(true);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    if (mobileQuery.matches) {
      setHistoryOpen(false);
    }

    function handleToggleHistory() {
      setHistoryOpen((open) => !open);
    }

    window.addEventListener(
      "toggle-chat-history",
      handleToggleHistory
    );

    return () => {
      window.removeEventListener(
        "toggle-chat-history",
        handleToggleHistory
      );
    };
  }, []);

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-black">
      {historyOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setHistoryOpen(false)}
          className="absolute inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {historyOpen && (
        <div className="absolute inset-y-0 left-0 z-40 flex w-[min(85vw,250px)] md:relative md:inset-auto md:z-auto md:w-[250px] md:shrink-0">
          <ConversationSidebar />
        </div>
      )}

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-black">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 px-3 md:hidden">
          <button
            type="button"
            aria-label={
              historyOpen
                ? "Close chat history"
                : "Open chat history"
            }
            onClick={() => setHistoryOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <Menu size={22} />
          </button>

          <span className="text-sm font-semibold tracking-wide text-white">
            xtent
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}