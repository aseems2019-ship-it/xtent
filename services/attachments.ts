import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function uploadAttachment(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in.");
  }

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("attachments")
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("attachments")
    .getPublicUrl(filePath);

  return data.publicUrl;
}