"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare } from "lucide-react";
import {
  createConversation,
  getConversations,
} from "@/services/conversations";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function ConversationSidebar() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();

    function handleRefresh() {
      loadConversations();
    }

    window.addEventListener(
      "conversation-updated",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "conversation-updated",
        handleRefresh
      );
    };
  }, []);

  async function loadConversations() {
    setLoading(true);

    const data = await getConversations();

    setConversations(data as Conversation[]);
    setLoading(false);
  }

  async function handleNewChat() {
    const conversation = await createConversation();

    if (!conversation) return;

    await loadConversations();
    window.dispatchEvent(
      new Event("conversation-updated")
    );

    router.push(`/chat/${conversation.id}`);
    router.refresh();
  }

  return (
    <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* New Chat */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3">
        {loading ? (
          <p className="px-3 py-2 text-sm text-zinc-500">
            Loading...
          </p>
        ) : conversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-zinc-500">
            No conversations yet
          </p>
        ) : (
          conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-white transition hover:bg-zinc-800"
            >
              <MessageSquare size={18} />

              <span className="truncate">
                {chat.title}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}