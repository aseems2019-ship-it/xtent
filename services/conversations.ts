import { createClient } from "@/lib/supabase/client";

export async function createConversation() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: "New Chat",
    })
    .select()
    .single();

  if (error) {
    console.error("Create conversation:", error);
    return null;
  }

  return data;
}

export async function getConversations() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get conversations:", error);
    return [];
  }

  return data ?? [];
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .update({
      title: cleanTitle.slice(0, 100),
    })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Update conversation title:", error);
    return false;
  }

  return true;
}

export async function deleteConversation(
  conversationId: string
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete conversation:", error);
    return false;
  }

  return true;
}

export async function renameConversation(
  conversationId: string,
  title: string
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .update({
      title: cleanTitle.slice(0, 100),
    })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Rename conversation:", error);
    return false;
  }

  return true;
}

export async function togglePinConversation(
  conversationId: string,
  pinned: boolean
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .update({
      pinned: !pinned,
    })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Pin conversation:", error);
    return false;
  }

  return true;
}

export async function moveConversationToFolder(
  conversationId: string,
  folderId: string | null
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .update({
      folder_id: folderId,
    })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Move conversation:", error);
    return false;
  }

  return true;
}