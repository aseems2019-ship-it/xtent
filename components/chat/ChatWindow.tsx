
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Lightbulb,
  Code2,
  FileText,
} from "lucide-react";

import { autoSaveMemory } from "@/services/memories";
import { extractDocument } from "@/services/document";
import { updateConversationTitle } from "@/services/conversations";
import {
  createMessage,
  getMessages,
  deleteMessagesAfter,
} from "@/services/messages";

import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ImageData {
  mimeType: string;
  data: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 **Welcome to xtent**\n\nHow can I help you today?",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const router = useRouter();

  const conversationId = params.id as string | undefined;

  // Convert an image file to Base64.
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Stop generating a response.
  function stopGenerating() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  }

  // Keep the latest messages visible inside the message area.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, loading]);

  // Load messages for the selected conversation.
  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!conversationId) {
        setMessages([
          {
            role: "assistant",
            content:
              "👋 **Welcome to xtent**\n\nHow can I help you today?",
          },
        ]);
        setLastUserMessage("");
        setEditingIndex(null);
        setEditingMessage("");
        return;
      }

      try {
        const data = await getMessages(conversationId);

        if (cancelled) return;

        if (data.length > 0) {
          setMessages(
            data.map((message) => ({
              role: message.role,
              content: message.content,
            }))
          );

          const latestUserMessage = [...data]
            .reverse()
            .find((message) => message.role === "user");

          setLastUserMessage(
            latestUserMessage?.content ?? ""
          );
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "👋 Hello! I'm **xtent AI**. How can I help you today?",
            },
          ]);
          setLastUserMessage("");
        }

        setEditingIndex(null);
        setEditingMessage("");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load messages:", error);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // Send a message, image, or extracted PDF text to the chat API.
  async function sendMessage(
    message: string,
    attachment?: File,
    regenerate = false
  ) {
    if (loading) return;

    let imageData: ImageData | null = null;
    let documentText = "";

    // Process attachments.
    if (attachment) {
      if (attachment.type.startsWith("image/")) {
        try {
          imageData = {
            mimeType: attachment.type,
            data: await fileToBase64(attachment),
          };
        } catch (error) {
          console.error("Image processing failed:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "❌ I couldn't process that image. Please try uploading it again.",
            },
          ]);
          return;
        }
      } else if (attachment.type === "application/pdf") {
        try {
          const result = await extractDocument(attachment);

          if (typeof result?.text === "string") {
            documentText = result.text.trim();
          }

          if (!documentText) {
            throw new Error("No readable text was found in the PDF.");
          }
        } catch (error) {
          console.error("PDF extraction failed:", error);

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "❌ I couldn't read that PDF. Please try uploading it again.",
            },
          ]);
          return;
        }
      }
    }

    // Display and remember the user's message.
    if (!regenerate) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
      ]);

      setLastUserMessage(message);
    }

    setLoading(true);

    try {
      // Save the user's message.
      if (conversationId && !regenerate) {
        await createMessage(conversationId, "user", message);
      }

      // Save useful conversational memory.
      if (message.trim()) {
        await autoSaveMemory(message);
      }

      // Give a new conversation a title.
      if (
        conversationId &&
        messages.length === 1 &&
        messages[0].role === "assistant" &&
        !regenerate
      ) {
        await updateConversationTitle(
          conversationId,
          message.split(" ").slice(0, 5).join(" ")
        );

        window.dispatchEvent(new Event("conversation-updated"));
      }

      controllerRef.current = new AbortController();

      const apiMessages = regenerate
        ? messages
        : [
            ...messages,
            { role: "user" as const, content: message },
          ];

      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controllerRef.current.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          image: imageData,
          messages: apiMessages,
          documentText: documentText || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Chat request failed: ${response.status}`;

        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Keep the default error message.
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Add an empty assistant message before streaming.
      if (regenerate) {
        setMessages((prev) => {
          const updated = [...prev];

          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "assistant"
          ) {
            updated.pop();
          }

          updated.push({
            role: "assistant",
            content: "",
          });

          return updated;
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);
      }

      // Stream the response.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        assistantReply += decoder.decode(value, {
          stream: true,
        });

        setMessages((prev) => {
          const updated = [...prev];

          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "assistant"
          ) {
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantReply,
            };
          }

          return updated;
        });
      }

      assistantReply += decoder.decode();

      // Save the completed assistant response.
      if (conversationId) {
        await createMessage(
          conversationId,
          "assistant",
          assistantReply
        );

        router.refresh();
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        console.log("Generation stopped.");
      } else {
        console.error("Chat error:", error);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "❌ Sorry, something went wrong. Please try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }

  // Edit a previous message and send it again.
  async function handleSend(
    message: string,
    image?: File
  ) {
    if (editingIndex !== null) {
      const index = editingIndex;

      setMessages((prev) => prev.slice(0, index));

      if (conversationId) {
        await deleteMessagesAfter(conversationId, index);
      }

      setEditingIndex(null);
      setEditingMessage("");
    }

    await sendMessage(message, image);
  }

  function useSuggestion(text: string) {
    void sendMessage(text);
  }

  const isFreshChat =
    !conversationId &&
    messages.length === 1 &&
    messages[0].role === "assistant" &&
    !loading;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-black">
      {/* Scrollable content area */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y ${
          isFreshChat ? "px-4 py-6 sm:px-6" : "px-4 py-6 sm:px-6 sm:py-8"
        }`}
      >
        {isFreshChat ? (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center py-4">
            {/* Brand mark */}
            <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg">
              <Sparkles size={22} className="text-cyan-400" />
            </div>

            {/* Welcome */}
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome to xtent
              </h1>

              <p className="mt-3 text-sm text-zinc-500 sm:text-base">
                Your AI. Your Space.
              </p>
            </div>

            {/* Suggestions */}
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  useSuggestion("Help me brainstorm some ideas")
                }
                className="group flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-left transition hover:border-zinc-800 hover:bg-zinc-900"
              >
                <Lightbulb
                  size={17}
                  className="shrink-0 text-zinc-500 transition group-hover:text-cyan-400"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                  Brainstorm ideas
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  useSuggestion("Help me write some code")
                }
                className="group flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-left transition hover:border-zinc-800 hover:bg-zinc-900"
              >
                <Code2
                  size={17}
                  className="shrink-0 text-zinc-500 transition group-hover:text-cyan-400"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                  Write code
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  useSuggestion("Help me understand this topic")
                }
                className="group flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-left transition hover:border-zinc-800 hover:bg-zinc-900"
              >
                <FileText
                  size={17}
                  className="shrink-0 text-zinc-500 transition group-hover:text-cyan-400"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                  Explain something
                </span>
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-zinc-700">
              xtent can make mistakes. Check important information.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                role={message.role}
                content={message.content}
                onEdit={
                  message.role === "user"
                    ? () => {
                        setEditingMessage(message.content);
                        setEditingIndex(index);
                      }
                    : undefined
                }
                onRegenerate={
                  message.role === "assistant"
                    ? () =>
                        void sendMessage(
                          lastUserMessage,
                          undefined,
                          true
                        )
                    : undefined
                }
              />
            ))}

            {!loading && lastUserMessage && (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    void sendMessage(
                      lastUserMessage,
                      undefined,
                      true
                    )
                  }
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
                >
                  ↻ Regenerate Response
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-3 pb-4">
                <TypingIndicator />

                <button
                  type="button"
                  onClick={stopGenerating}
                  className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950/40"
                >
                  ■ Stop generating
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Shared bottom composer: stays at the bottom for fresh and existing chats */}
      <div className="z-10 shrink-0 bg-black px-3 pb-3 pt-2 sm:px-6 sm:pb-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-1 shadow-2xl shadow-black/30 transition focus-within:border-zinc-700">
            <ChatInput
              initialMessage={editingMessage}
              loading={loading}
              onSend={handleSend}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
