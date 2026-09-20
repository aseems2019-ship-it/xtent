import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function createFolder(name: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("folders")
    .insert({
      user_id: user.id,
      name,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getFolders() {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function renameFolder(
  folderId: string,
  name: string
) {
  const { error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", folderId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function deleteFolder(folderId: string) {
  // Move chats back to Other Chats
  await supabase
    .from("conversations")
    .update({ folder_id: null })
    .eq("folder_id", folderId);

  // Delete the folder
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}