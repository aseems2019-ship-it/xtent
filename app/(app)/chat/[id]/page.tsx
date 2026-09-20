import ConversationSidebar from "@/components/chat/ConversationSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatConversationPage() {
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-black">
      {/* Conversation Sidebar */}
      <ConversationSidebar />

      {/* Main Chat Area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-black">
        <ChatWindow />
      </main>
    </div>
  );
}