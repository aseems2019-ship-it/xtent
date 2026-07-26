"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { updateConversationTitle } from "@/services/conversations";
import {
  createMessage,
  getMessages,
} from "@/services/messages";
import { useParams, useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm **XtenT AI**. How can I help you today?",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string | undefined;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);
  useEffect(() => {
  async function loadMessages() {
    if (!conversationId) return;

    const data = await getMessages(conversationId);

    if (data.length > 0) {
      setMessages(
        data.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hello! I'm **XtenT AI**. How can I help you today?",
        },
      ]);
    }
  }

  loadMessages();
}, [conversationId]);

  async function handleSend(message: string) {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    if (conversationId) {
      await createMessage(
        conversationId,
        "user",
        message
      );
    }
    if (
      conversationId &&
      messages.length === 1 &&
      messages[0].role === "assistant"
    ) {
     console.log("Updating title:", conversationId, message);

    await updateConversationTitle(
      conversationId,
      message.slice(0, 40)
    );
    window.dispatchEvent(
      new Event("conversation-updated")
    );

    console.log("Title update finished");

    }
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);

      if (conversationId) {
        await createMessage(
          conversationId,
          "assistant",
          data.reply
        );
        router.refresh();
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Sorry, something went wrong.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
}