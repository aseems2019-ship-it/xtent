import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function createMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
export async function deleteMessagesAfter(
  conversationId: string,
  messageIndex: number
) {
  const { data, error } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return false;

  const idsToDelete = data
    .slice(messageIndex + 1)
    .map((m) => m.id);

  if (idsToDelete.length === 0) return true;

  const { error: deleteError } = await supabase
    .from("messages")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    console.error(deleteError);
    return false;
  }

  return true;
}