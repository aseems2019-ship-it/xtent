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

import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

import { updateConversationTitle } from "@/services/conversations";

import {
  createMessage,
  getMessages,
  deleteMessagesAfter,
} from "@/services/messages";

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

  const controllerRef =
    useRef<AbortController | null>(null);

  const [editingMessage, setEditingMessage] =
    useState("");

  const [lastUserMessage, setLastUserMessage] =
    useState("");

  const [editingIndex, setEditingIndex] =
    useState<number | null>(null);

  const params = useParams();
  const router = useRouter();

  const conversationId =
    params.id as string | undefined;

  const bottomRef =
    useRef<HTMLDivElement>(null);

  // ---------------------------------------
  // Convert image to Base64
  // ---------------------------------------
  async function fileToBase64(
    file: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

        resolve(result.split(",")[1]);
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsDataURL(file);
    });
  }

  // ---------------------------------------
  // Stop generating
  // ---------------------------------------
  function stopGenerating() {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    setLoading(false);
  }

  // ---------------------------------------
  // Auto scroll
  // ---------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ---------------------------------------
  // Load conversation
  // ---------------------------------------
  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) return;

      try {
        const data =
          await getMessages(conversationId);

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
                "👋 Hello! I'm **xtent AI**. How can I help you today?",
            },
          ]);
        }
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error
        );
      }
    }

    loadMessages();
  }, [conversationId]);

  // ---------------------------------------
  // Send message
  // ---------------------------------------
  async function sendMessage(
    message: string,
    attachment?: File,
    regenerate = false
  ) {
    if (loading) return;

    let imageData: ImageData | null = null;
    let documentText = "";

    // ---------------------------------------
    // Process attachment
    // ---------------------------------------
    if (attachment) {
      // IMAGE
      if (attachment.type.startsWith("image/")) {
        imageData = {
          mimeType: attachment.type,
          data: await fileToBase64(attachment),
        };
      }

      // PDF
      else if (
        attachment.type === "application/pdf"
      ) {
        try {
          console.log(
            "Processing PDF attachment..."
          );

          const result =
            await extractDocument(attachment);

          if (
            result &&
            typeof result.text === "string"
          ) {
            documentText =
              result.text.trim();
          }

          if (!documentText) {
            throw new Error(
              "No readable text was found in the PDF."
            );
          }

          console.log(
            "PDF text extracted successfully."
          );
        } catch (error) {
          console.error(
            "PDF extraction failed:",
            error
          );

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

    // ---------------------------------------
    // Display user message
    //
    // IMPORTANT:
    // PDF CONTENT IS NOT DISPLAYED HERE.
    // Only the user's actual message is shown.
    // ---------------------------------------
    if (!regenerate) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: message,
        },
      ]);

      setLastUserMessage(message);
    }

    setLoading(true);

    // ---------------------------------------
    // Save user message
    // ---------------------------------------
    if (
      conversationId &&
      !regenerate
    ) {
      await createMessage(
        conversationId,
        "user",
        message
      );
    }

    // ---------------------------------------
    // Save memory
    // ---------------------------------------
    if (message.trim()) {
      await autoSaveMemory(message);
    }

    // ---------------------------------------
    // Update title
    // ---------------------------------------
    if (
      conversationId &&
      messages.length === 1 &&
      messages[0].role === "assistant" &&
      !regenerate
    ) {
      await updateConversationTitle(
        conversationId,
        message
          .split(" ")
          .slice(0, 5)
          .join(" ")
      );

      window.dispatchEvent(
        new Event("conversation-updated")
      );
    }

    try {
      controllerRef.current =
        new AbortController();

      // ---------------------------------------
      // Build API messages
      // ---------------------------------------
      const apiMessages = [
        ...messages,
        {
          role: "user" as const,
          content: message,
        },
      ];

      // ---------------------------------------
      // Send to Chat API
      // ---------------------------------------
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          signal:
            controllerRef.current.signal,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            conversationId,

            image: imageData,

            messages: apiMessages,

            // IMPORTANT:
            // Send extracted PDF text separately.
            documentText:
              documentText || undefined,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          `Chat request failed: ${response.status}`;

        try {
          const errorData =
            await response.json();

          if (
            errorData?.error
          ) {
            errorMessage =
              errorData.error;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(
          errorMessage
        );
      }

      if (!response.body) {
        throw new Error(
          "No response body"
        );
      }

      let assistantReply = "";

      // ---------------------------------------
      // Prepare assistant message
      // ---------------------------------------
      if (regenerate) {
        setMessages((prev) => {
          const updated = [...prev];

          if (
            updated.length > 0 &&
            updated[
              updated.length - 1
            ].role === "assistant"
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
          {
            role: "assistant",
            content: "",
          },
        ]);
      }

      // ---------------------------------------
      // Stream response
      // ---------------------------------------
      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      while (true) {
        const {
          done,
          value,
        } = await reader.read();

        if (done) break;

        assistantReply +=
          decoder.decode(value, {
            stream: true,
          });

        setMessages((prev) => {
          const updated = [...prev];

          if (
            updated.length > 0 &&
            updated[
              updated.length - 1
            ].role === "assistant"
          ) {
            updated[
              updated.length - 1
            ] = {
              role: "assistant",
              content: assistantReply,
            };
          }

          return updated;
        });
      }

      assistantReply +=
        decoder.decode();

      // ---------------------------------------
      // Save assistant message
      // ---------------------------------------
      if (conversationId) {
        await createMessage(
          conversationId,
          "assistant",
          assistantReply
        );

        router.refresh();
      }
    } catch (error: any) {
      if (
        error?.name ===
        "AbortError"
      ) {
        console.log(
          "Generation stopped."
        );
      } else {
        console.error(
          "Chat error:",
          error
        );

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

  // ---------------------------------------
  // Fresh chat
  // ---------------------------------------
  const isFreshChat =
    messages.length === 1 &&
    messages[0].role === "assistant" &&
    !loading;

  // ---------------------------------------
  // Quick suggestion
  // ---------------------------------------
  function useSuggestion(
    text: string
  ) {
    sendMessage(text);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-black">

      {/* =====================================
          FRESH CHAT
      ====================================== */}
      {isFreshChat ? (
        <div className="flex min-h-0 flex-1 flex-col">

          <div className="flex flex-1 items-center justify-center px-6">

            <div className="flex w-full max-w-3xl flex-col items-center">

              {/* Brand mark */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg">
                <Sparkles
                  size={22}
                  className="text-cyan-400"
                />
              </div>

              {/* Welcome */}
              <div className="mb-8 text-center">

                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Welcome to xtent
                </h1>

                <p className="mt-3 text-base text-zinc-500">
                  Your AI. Your Space.
                </p>

              </div>

              {/* Input */}
              <div className="w-full">

                <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-1 shadow-2xl shadow-black/40 transition focus-within:border-zinc-700">

                  <ChatInput
                    initialMessage={
                      editingMessage
                    }
                    loading={loading}
                    onSend={async (
                      message,
                      image
                    ) => {

                      if (
                        editingIndex !== null
                      ) {
                        setMessages(
                          (prev) =>
                            prev.slice(
                              0,
                              editingIndex
                            )
                        );

                        if (
                          conversationId
                        ) {
                          await deleteMessagesAfter(
                            conversationId,
                            editingIndex
                          );
                        }

                        setEditingIndex(
                          null
                        );

                        setEditingMessage(
                          ""
                        );
                      }

                      await sendMessage(
                        message,
                        image
                      );
                    }}
                  />

                </div>

              </div>

              {/* Suggestions */}
              <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">

                <button
                  onClick={() =>
                    useSuggestion(
                      "Help me brainstorm some ideas"
                    )
                  }
                  className="group flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-left transition hover:border-zinc-800 hover:bg-zinc-900"
                >
                  <Lightbulb
                    size={17}
                    className="text-zinc-500 transition group-hover:text-cyan-400"
                  />

                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                    Brainstorm ideas
                  </span>
                </button>

                <button
                  onClick={() =>
                    useSuggestion(
                      "Help me write some code"
                    )
                  }
                  className="group flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-left transition hover:border-zinc-800 hover:bg-zinc-900"
                >
                  <Code2
                    size={17}
                    className="text-zinc-500 transition group-hover:text-cyan-400"
                  />

                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                    Write code
                  </span>
                </button>

                <button
                  onClick={() =>
                    useSuggestion(
                      "Help me understand this topic"
                    )
                  }
                  className="group flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-left transition hover:border-zinc-800 hover:bg-zinc-900"
                >
                  <FileText
                    size={17}
                    className="text-zinc-500 transition group-hover:text-cyan-400"
                  />

                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                    Explain something
                  </span>
                </button>

              </div>

              {/* Footer */}
              <div className="mt-5 text-center text-xs text-zinc-700">
                xtent can make mistakes. Check important information.
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* =====================================
           NORMAL CONVERSATION
        ====================================== */
        <div className="flex min-h-0 flex-1 flex-col">

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">

            <div className="mx-auto w-full max-w-4xl">

              {messages.map(
                (
                  message,
                  index
                ) => (
                  <MessageBubble
                    key={index}
                    role={message.role}
                    content={
                      message.content
                    }
                    onEdit={() => {
                      if (
                        message.role ===
                        "user"
                      ) {
                        setEditingMessage(
                          message.content
                        );

                        setEditingIndex(
                          index
                        );
                      }
                    }}
                    onRegenerate={
                      message.role ===
                      "assistant"
                        ? () =>
                            sendMessage(
                              lastUserMessage,
                              undefined,
                              true
                            )
                        : undefined
                    }
                  />
                )
              )}

              {!loading &&
                lastUserMessage && (
                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={() =>
                        sendMessage(
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
                    onClick={
                      stopGenerating
                    }
                    className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950/40"
                  >
                    ■ Stop generating
                  </button>

                </div>
              )}

              <div ref={bottomRef} />

            </div>

          </div>

          {/* Bottom input */}
          <div className="shrink-0 px-4 pb-4 pt-2 sm:px-6">

            <div className="mx-auto max-w-4xl">

              <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-1 shadow-2xl shadow-black/30">

                <ChatInput
                  initialMessage={
                    editingMessage
                  }
                  loading={loading}
                  onSend={async (
                    message,
                    image
                  ) => {

                    if (
                      editingIndex !== null
                    ) {
                      setMessages(
                        (prev) =>
                          prev.slice(
                            0,
                            editingIndex
                          )
                      );

                      if (
                        conversationId
                      ) {
                        await deleteMessagesAfter(
                          conversationId,
                          editingIndex
                        );
                      }

                      setEditingIndex(
                        null
                      );

                      setEditingMessage(
                        ""
                      );
                    }

                    await sendMessage(
                      message,
                      image
                    );
                  }}
                />

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
