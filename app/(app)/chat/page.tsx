import ConversationSidebar from "@/components/chat/ConversationSidebar";

export default function ChatPage() {
  return (
    <div className="flex h-full bg-black">
      <ConversationSidebar />

      <div className="flex flex-1 flex-col text-white">
        {/* Header */}
        <div className="border-b border-zinc-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-cyan-400">
            AI Chat
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-xl bg-zinc-900 p-4">
              👋 Welcome to XtenT AI
            </div>

            <div className="rounded-xl bg-cyan-500 p-4 text-black">
              Ask me anything...
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-4">
          <div className="mx-auto flex max-w-4xl gap-3">
            <input
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="Message XtenT..."
            />

            <button className="rounded-xl bg-cyan-500 px-6 font-semibold text-black hover:bg-cyan-400">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}