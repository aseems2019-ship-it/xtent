import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function saveMemory(content: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase.from("memories").insert({
    user_id: user.id,
    content,
    importance: 1,
  });

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function getMemories() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", user.id)
    .order("importance", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function deleteMemory(id: string) {
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export async function autoSaveMemory(message: string) {
  const lower = message.toLowerCase();

  const triggers = [
    "my name is",
    "i am",
    "i'm",
    "my favourite",
    "my favorite",
    "i like",
    "i love",
    "i live",
    "i study",
    "i work",
    "my birthday",
    "my goal",
    "my favorite color",
    "my favourite color",
  ];

  const shouldRemember = triggers.some((trigger) =>
    lower.includes(trigger)
  );

  if (!shouldRemember) return;

  await saveMemory(message);
}

export async function getMemoryPrompt() {
  const memories = await getMemories();

  if (!memories.length) return "";

  return `
You already know these facts about the user:

${memories
  .map((m) => `- ${m.content}`)
  .join("\n")}

Use these memories ONLY when they are relevant.
Do not mention them unless they help answer the current question.
`;
}