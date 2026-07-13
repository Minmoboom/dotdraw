import { createClient } from "@/lib/supabase/client";

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string;
  tool_calls?: any;
  created_at: string;
}

export function getSupabase() {
  return createClient();
}

export async function getUser() {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch conversations:", error);
    return [];
  }
  return data || [];
}

export async function createConversation(title: string, id?: string): Promise<Conversation | null> {
  const supabase = getSupabase();
  const user = await getUser();
  if (!user) return null;

  const insert: any = { title, user_id: user.id };
  if (id) insert.id = id;

  const { data, error } = await supabase
    .from("conversations")
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error("Failed to create conversation:", error);
    return null;
  }
  return data;
}

export async function updateConversationTitle(id: string, title: string) {
  const supabase = getSupabase();
  await supabase.from("conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteConversation(id: string) {
  const supabase = getSupabase();
  await supabase.from("messages").delete().eq("conversation_id", id);
  await supabase.from("conversations").delete().eq("id", id);
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function saveMessage(msg: {
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string;
  tool_calls?: any;
}) {
  const supabase = getSupabase();
  await supabase.from("messages").insert({
    ...msg,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  });
  // Update conversation timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", msg.conversation_id);
}

export function groupConversationsByMonth(
  conversations: Conversation[]
): { label: string; items: Conversation[] }[] {
  const groups: Record<string, Conversation[]> = {};
  const now = new Date();
  const currentYear = now.getFullYear();

  for (const conv of conversations) {
    const d = new Date(conv.updated_at);
    let label: string;
    if (d.getFullYear() === currentYear) {
      label = d.toLocaleDateString("en-US", { month: "long" }); // "July"
    } else {
      label = `${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`; // "July 2025"
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  // Maintain insertion order (most recent first)
  const seen = new Set<string>();
  const result: { label: string; items: Conversation[] }[] = [];
  for (const conv of conversations) {
    const d = new Date(conv.updated_at);
    let label: string;
    if (d.getFullYear() === currentYear) {
      label = d.toLocaleDateString("en-US", { month: "long" });
    } else {
      label = `${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`;
    }
    if (!seen.has(label)) {
      seen.add(label);
      result.push({ label, items: groups[label] });
    }
  }
  return result;
}
