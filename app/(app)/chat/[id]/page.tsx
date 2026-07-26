import ConversationSidebar from "@/components/chat/ConversationSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Chat Window */}
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}