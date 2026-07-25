interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { id } = await params;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold text-cyan-400">
        Conversation
      </h1>

      <p className="mt-4 text-zinc-400">
        Conversation ID:
      </p>

      <code className="text-cyan-300">{id}</code>
    </div>
  );
}