import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function createConversation() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: "New Chat",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  const { data, error } = await supabase
    .from("conversations")
    .update({
      title,
    })
    .eq("id", conversationId)
    .select();

  console.log("Conversation ID:", conversationId);
  console.log("New title:", title);
  console.log("Updated row:", data);

  if (error) {
    console.error("Update failed:", error);
    return false;
  }

  return true;
}