"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({
  role,
  content,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState("");

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);

    setCopied(code);

    setTimeout(() => {
      setCopied("");
    }, 2000);
  }

  return (
    <div
      className={`mb-6 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 ${
          isUser
            ? "bg-cyan-500 text-black"
            : "bg-zinc-900 text-white"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const code = String(children).replace(/\n$/, "");

              if (!inline && match) {
                return (
                  <div className="my-4 overflow-hidden rounded-xl border border-zinc-700">
                    <div className="flex items-center justify-between bg-zinc-800 px-4 py-2 text-sm">
                      <span className="font-medium text-zinc-300">
                        {match[1]}
                      </span>

                      <button
                        onClick={() => copyCode(code)}
                        className="flex items-center gap-2 rounded px-2 py-1 text-zinc-300 transition hover:bg-zinc-700"
                      >
                        {copied === code ? (
                          <>
                            <Check size={16} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                      }}
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              return (
                <code
                  className="rounded bg-zinc-800 px-1 py-0.5 text-cyan-300"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}