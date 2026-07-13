"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getSupabase,
  getUser,
  getConversations,
  createConversation,
  updateConversationTitle,
  getMessages,
  saveMessage,
  type Conversation,
} from "@/lib/conversations";

interface MessageWithId {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  toolCalls?: any[];
}

interface LocalConversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: MessageWithId[];
}

interface ConversationContextType {
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  conversations: Conversation[];
  currentId: string | null;
  currentTitle: string;
  messages: MessageWithId[];
  isLoggedIn: boolean;
  loading: boolean;
  setMessages: (msgs: MessageWithId[] | ((prev: MessageWithId[]) => MessageWithId[])) => void;
  switchConversation: (id: string) => Promise<void>;
  newConversation: () => void;
  persistMessages: (msgs: MessageWithId[]) => Promise<void>;
}

const ctx = createContext<ConversationContextType>({
  conversations: [],
  currentId: null,
  currentTitle: "New Chat",
  messages: [],
  isLoggedIn: false,
  loading: true,
  setMessages: () => {},
  switchConversation: async () => {},
  newConversation: () => {},
  persistMessages: async () => {},
  renameConversation: () => {},
  deleteConversation: () => {},
});

// LocalStorage helpers — each conversation stored separately
const LIST_KEY = "dotdraw_list";

function getLocalList(): { id: string; title: string; updatedAt: string }[] {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || "[]"); } catch { return []; }
}
function saveLocalList(list: { id: string; title: string; updatedAt: string }[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}
function getLocalConv(id: string): LocalConversation | undefined {
  try {
    const raw = localStorage.getItem("dotdraw_" + id);
    return raw ? JSON.parse(raw) : undefined;
  } catch { return undefined; }
}
function saveLocalConv(id: string, title: string, messages: MessageWithId[]) {
  localStorage.setItem("dotdraw_" + id, JSON.stringify({ id, title, updatedAt: new Date().toISOString(), messages }));
  // Update list
  const list = getLocalList();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) { list[idx] = { id, title, updatedAt: new Date().toISOString() }; }
  else { list.unshift({ id, title, updatedAt: new Date().toISOString() }); }
  saveLocalList(list);
}

function genId() {
  // Generate a proper UUID v4
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("New Chat");
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-save messages to localStorage + Supabase whenever they change
  // Sync messages to Supabase
  const syncToSupabase = useCallback(async (convId: string, title: string, msgs: MessageWithId[]) => {
    if (!isLoggedIn) return;
    try {
      const user = await getUser();
      if (!user) return;

      const existingConvs = await getConversations();

      if (!existingConvs.find((c) => c.id === convId)) {
        await createConversation(title, convId);
      } else {
        await updateConversationTitle(convId, title);
      }

      const existing = await getMessages(convId);
      for (const m of msgs) {
        if (!existing.find((em) => em.id === m.id)) {
          await saveMessage({
            conversation_id: convId,
            role: m.role,
            content: m.content,
            image_url: m.imageUrl,
            tool_calls: m.toolCalls,
          });
        }
      }
    } catch (e) {
      console.error("Sync failed:", e);
    }
  }, [isLoggedIn]);

  const switchConversation = useCallback(async (id: string) => {
    const localConv = getLocalConv(id);
    if (!localConv) {
      setCurrentId(id);
      setCurrentTitle("Chat");
      setMessages([]);
      return;
    }

    setCurrentId(id);
    setCurrentTitle(localConv.title);
    setMessages(localConv.messages);

    // Background: sync from Supabase if available
    if (isLoggedIn) {
      try {
        const supaMsgs = await getMessages(id);
        if (supaMsgs.length > 0) {
          const loaded = supaMsgs.map((m: any) => ({
            id: m.id || genId(),
            role: m.role as "user" | "assistant",
            content: m.content || "",
            imageUrl: m.image_url || m.imageUrl,
            toolCalls: m.tool_calls || m.toolCalls,
          }));
          setMessages(loaded);
          saveLocalConv(id, localConv.title, loaded);
        }
      } catch {}
    }
  }, [isLoggedIn]);

  const [supabaseSynced, setSupabaseSynced] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  // When isLoggedIn becomes true, sync pending conversations
  useEffect(() => {
    if (isLoggedIn && pendingSync) {
      const list = getLocalList();
      for (const c of list) {
        const conv = getLocalConv(c.id);
        if (conv) {
          syncToSupabase(c.id, c.title, conv.messages).catch(() => {});
        }
      }
      setPendingSync(false);
      setSupabaseSynced(true);
    }
  }, [isLoggedIn, pendingSync, syncToSupabase]);

  useEffect(() => {
    if (messages.length === 0) return;

    // Generate real ID if needed
    let convId = currentId;
    if (!convId) {
      convId = genId();
      // Don't call setCurrentId here directly - it would cause loop
    }

    const title = currentTitle === "New Chat" && messages.find((m) => m.role === "user")
      ? messages.find((m) => m.role === "user")!.content.slice(0, 40)
      : currentTitle;

    if (title !== "New Chat" && currentTitle === "New Chat") {
      setCurrentTitle(title);
    }
    if (!currentId) {
      setCurrentId(convId);
    }

    // Save to localStorage
    saveLocalConv(convId, title, messages);
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === convId);
      if (exists) {
        return prev.map((c) => c.id === convId ? { ...c, title, updated_at: new Date().toISOString() } : c);
      }
      return [{ id: convId, title, user_id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...prev];
    });

    // Sync to Supabase
    if (isLoggedIn && convId) {
      if (!supabaseSynced) {
        syncToSupabase(convId, title, messages)
          .then(() => setSupabaseSynced(true))
          .catch(() => {});
      }
    } else if (convId) {
      // Not logged in yet — mark for later sync
      setPendingSync(true);
    }
  }, [messages, currentId, currentTitle, isLoggedIn, supabaseSynced, syncToSupabase]);

  // Sync from localStorage on mount
  useEffect(() => {
    const list = getLocalList();
    if (list.length > 0) {
      setConversations(
        list.map((c) => ({
          id: c.id,
          title: c.title,
          user_id: "",
          created_at: c.updatedAt,
          updated_at: c.updatedAt,
        }))
      );
    }
    setLoading(false);

    // Check Supabase auth
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        // Load from Supabase and merge
        getConversations().then((supaConvs) => {
          if (supaConvs.length > 0) {
            setConversations((prev) => {
              const merged = [...prev];
              for (const sc of supaConvs) {
                if (!merged.find((m) => m.id === sc.id)) merged.push(sc);
              }
              return merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            });
          }
        });
      }
    });
  }, []);

  const newConversation = useCallback(() => {
    setCurrentId(null);
    setCurrentTitle("New Chat");
    setMessages([]);
  }, []);

  const persistMessages = useCallback(
    async (msgs: MessageWithId[]) => {
      // LocalStorage saving is handled by the auto-save useEffect above
      // This function only handles Supabase cloud sync
      if (isLoggedIn && currentId) {
        try {
          syncToSupabase(currentId, currentTitle, msgs);
          setSupabaseSynced(true);
        } catch {}
      }
    },
    [isLoggedIn, currentId, currentTitle, syncToSupabase]
  );

  const renameConversation = useCallback((id: string, title: string) => {
    const conv = getLocalConv(id);
    if (conv) { saveLocalConv(id, title, conv.messages); }
    else { const list = getLocalList(); const item = list.find((c) => c.id === id); if (item) { item.title = title; saveLocalList(list); } }
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
    if (currentId === id) setCurrentTitle(title);
    if (isLoggedIn) updateConversationTitle(id, title).catch(() => {});
  }, [currentId, isLoggedIn]);

  const deleteLocalConv = useCallback((id: string) => {
    const list = getLocalList().filter((c) => c.id !== id);
    saveLocalList(list);
    localStorage.removeItem("dotdraw_" + id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentId === id) { setCurrentId(null); setCurrentTitle("New Chat"); setMessages([]); }
    if (isLoggedIn) { import("@/lib/conversations").then((m) => m.deleteConversation(id).catch(() => {})); }
  }, [currentId, isLoggedIn]);

  return (
    <ctx.Provider
      value={{
        conversations,
        currentId,
        currentTitle,
        messages,
        isLoggedIn,
        loading,
        setMessages,
        switchConversation,
        newConversation,
        persistMessages,
        renameConversation,
        deleteConversation: deleteLocalConv,
      }}
    >
      {children}
    </ctx.Provider>
  );
}

export function useConversation() {
  return useContext(ctx);
}
