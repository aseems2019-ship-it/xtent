"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({
  role,
  content,
}: Props) {
  const isUser = role === "user";

  return (
    <div
      className={`mb-6 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-4xl rounded-2xl px-5 py-4 shadow-lg ${
          isUser
            ? "bg-cyan-600 text-white"
            : "border border-zinc-800 bg-zinc-900 text-zinc-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className } = props;

                  const match =
                    /language-(\w+)/.exec(
                      className || ""
                    );

                  if (!match) {
                    return (
                      <code className="rounded bg-zinc-800 px-1 py-0.5">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        borderRadius: "12px",
                        padding: "18px",
                        fontSize: "14px",
                      }}
                    >
                      {String(children).replace(
                        /\n$/,
                        ""
                      )}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}