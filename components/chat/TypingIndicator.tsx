"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"></span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}