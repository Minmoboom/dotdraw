"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@/context/ConversationContext";

interface ToolCallState {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  displayName: string;
  message?: string;
  images?: string[];
  thinkingText?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  toolCalls?: ToolCallState[];
}

const GREEN = "#10B981";

const SUGGESTION_CARDS = [
  {
    title: "Brand Logo",
    subtitle: "Marks & wordmarks",
    prompt: "Design a brand logo for an artisan coffee roaster — warm, crafted, a little editorial.",
    bg: "#ECFDF5",
    iconColor: "#047857",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "Poster",
    subtitle: "Layouts & key art",
    prompt: "Design an event poster for a late-night jazz show.",
    bg: "#FFF7ED",
    iconColor: "#C2410C",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
  },
  {
    title: "Mobile APP",
    subtitle: "iOS & Android screens",
    prompt: "Design a mobile app home screen for a meditation app — calm minimal iOS layout with a bottom tab bar, a greeting header, and a featured session card.",
    bg: "#F5F3FF",
    iconColor: "#6D28D9",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    title: "Remix",
    subtitle: "Restyle an image",
    prompt: "Remix a photo into a bold risograph poster.",
    bg: "#FCE7F3",
    iconColor: "#BE185D",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
];

type Mode = "agent" | "copilot";
type GenTab = "image" | "video";
type ImageCount = 1 | 2 | 4;
type ImageResolution = "1k" | "2k" | "4k";
type VideoResolution = "auto" | "480p" | "720p";
type Duration = "auto" | "4s" | "5s" | "6s" | "8s" | "10s" | "15s";

const SKILLS = [
  { id: "image-delivery", name: "Image Delivery", desc: "Default image generation best practices" },
  { id: "brand-identity", name: "Brand Identity", desc: "Logo, visual identity, brand kit design" },
  { id: "brand-campaign", name: "Brand Campaign", desc: "Full marketing visual suite" },
  { id: "ecommerce-product", name: "E-commerce Product", desc: "Product images & infographics" },
  { id: "amazon-product", name: "Amazon Product", desc: "Amazon listing images & A+ Content" },
  { id: "ugc-style", name: "UGC Style", desc: "Authentic lifestyle product photos" },
  { id: "instagram-post", name: "Instagram Post", desc: "Feed, Stories, Reels design" },
  { id: "rednote-cover", name: "RedNote Cover", desc: "小红书 cover layout design" },
  { id: "youtube-thumbnail", name: "YouTube Thumbnail", desc: "16:9 click-driven thumbnails" },
  { id: "ad-creative", name: "Ad Creative", desc: "Multi-platform ad materials" },
  { id: "fashion-outfit", name: "Fashion Outfit", desc: "Editorial fashion styling" },
  { id: "video-creation", name: "Video Creation", desc: "Short-form AI video production" },
  { id: "drone-camera", name: "Drone Camera", desc: "Cinematic aerial shots" },
  { id: "slide-deck", name: "Slide Deck", desc: "Presentation/PPT design" },
];

export default function ChatPanel() {
  const { messages, setMessages, persistMessages, isLoggedIn } = useConversation();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<Mode>("agent");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [genTab, setGenTab] = useState<GenTab>("image");
  const [imageCount, setImageCount] = useState<ImageCount>(1);
  const [ratio, setRatio] = useState("Auto");
  const [imageResolution, setImageResolution] = useState<ImageResolution>("1k");
  const [videoResolution, setVideoResolution] = useState<VideoResolution>("auto");
  const [duration, setDuration] = useState<Duration>("auto");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (skillsRef.current && !skillsRef.current.contains(e.target as Node)) {
        setSkillsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImage(null);
    setIsGenerating(true);

    // Add a placeholder assistant message for streaming
    const assistantId = (Date.now() + 1).toString();
    const userMsgForPersist = { ...userMessage };
    const placeholderMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      toolCalls: [],
    };
    setMessages((prev) => [...prev, placeholderMsg]);

    // Ref to collect final messages for persisting
    let finalMsgRef: Message | null = null;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, skill: selectedSkill }),
      });

      if (!response.ok) throw new Error("Agent failed");
      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let thinkText = "";
      let isThinking = false;
      const liveToolCalls: ToolCallState[] = [];

      const updateMessage = () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: thinkText, toolCalls: [...liveToolCalls] }
              : m
          )
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/);
          if (!match) continue;

          try {
            const event = JSON.parse(match[1]);

            switch (event.type) {
              case "thinking": {
                isThinking = true;
                // Mark previous thinking chips as completed
                liveToolCalls.forEach((t) => {
                  if (t.name === "thinking" && t.status === "running") {
                    t.status = "completed";
                  }
                });
                // Each round gets its own thinking chip
                const roundNum = liveToolCalls.filter((t) => t.name === "thinking").length + 1;
                liveToolCalls.unshift({
                  id: "thinking-" + Date.now(),
                  name: "thinking",
                  status: "running",
                  displayName: `Thinking · Round ${roundNum}`,
                  thinkingText: event.content || "",
                });
                updateMessage();
                break;
              }

              case "tool_call": {
                const tc: ToolCallState = {
                  id: event.name + "-" + Date.now(),
                  name: event.name,
                  status: "running",
                  displayName: event.displayName || event.name,
                };
                liveToolCalls.push(tc);
                updateMessage();
                break;
              }

              case "tool_result": {
                const idx = liveToolCalls.findIndex(
                  (t) => t.name === event.name && t.status === "running"
                );
                if (idx >= 0) {
                  liveToolCalls[idx] = {
                    ...liveToolCalls[idx],
                    status: event.status,
                    message: event.content,
                    images: event.images,
                  };
                }
                updateMessage();
                break;
              }

              case "text": {
                // Update the most recent running thinking chip
                const runningThinkChip = [...liveToolCalls].reverse().find((t) => t.name === "thinking" && t.status === "running");
                if (runningThinkChip) {
                  runningThinkChip.status = "completed";
                  runningThinkChip.thinkingText = (runningThinkChip.thinkingText || "") + "\n" + (event.content || "");
                }
                thinkText += (thinkText ? "\n\n" : "") + event.content;
                updateMessage();
                break;
              }

              case "error":
                thinkText += "\n\n❌ " + (event.content || "Error");
                updateMessage();
                break;

              case "done":
                // Finalize all thinking and tool chips
                setMessages((prev) => {
                  const updated = prev.map((m) => {
                    if (m.id !== assistantId) return m;
                    const cleanCalls = (m.toolCalls || []).map((tc) =>
                      tc.status === "running" ? { ...tc, status: "completed" as const, thinkingText: tc.thinkingText || tc.message || "" } : tc
                    );
                    const generatedImages = cleanCalls
                      .filter((t) => t.images?.length)
                      .flatMap((t) => t.images!);
                    const finalMsg = {
                      ...m,
                      content: thinkText,
                      imageUrl: generatedImages[0],
                      toolCalls: cleanCalls,
                    };
                    finalMsgRef = finalMsg; // Store for persisting
                    return finalMsg;
                  });
                  return updated;
                });
                break;
            }
          } catch { /* skip malformed events */ }
        }
      }

      // Persist conversation after streaming completes
      if (finalMsgRef) {
        persistMessages([userMsgForPersist, finalMsgRef]);
      }
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, " + (error.message || "something went wrong.") }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCardClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleMode = () => setMode((prev) => (prev === "agent" ? "copilot" : "agent"));

  const settingsSummary =
    genTab === "image"
      ? `Image · ${ratio} · ${imageResolution.toUpperCase()}`
      : `Video · ${videoResolution} · ${duration}`;

  // Common button styles
  const greenBtn = `text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer`;
  const greenBtnSelected = `text-white`;
  const greenBtnUnselected = `bg-white border border-[#e5e0d8] text-[#1a1a1a] hover:border-[#d5cfc5]`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#faf8f5]">
      {/* Chat Messages */}
      <div className={`overflow-y-auto px-6 py-4 space-y-6 ${messages.length > 0 ? "flex-1" : ""}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "text-white"
                  : "bg-white border border-[#e5e0d8] text-[#1a1a1a]"
              }`}
              style={msg.role === "user" ? { backgroundColor: GREEN } : undefined}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {/* Tool call chips */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <ToolCallChips chips={msg.toolCalls} />
              )}
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Generated" className="mt-3 rounded-lg w-full" />
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e5e0d8] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: GREEN }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: GREEN }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: GREEN }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Landing-state: centered title + input + cards */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center px-6 py-2 overflow-y-auto">
          <div className="w-full max-w-xl my-auto">


          {/* Green D Icon + Title */}
          <div className="text-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
              style={{ backgroundColor: GREEN }}
            >
              <span className="text-white text-2xl font-bold italic tracking-tight">D</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 tracking-tight">
              DotDraw, your design agent
            </h1>
            <p className="text-sm text-[#6b6b6b]">
              Create anything you can describe
            </p>
          </div>

          {/* Input Box */}
          <div className="w-full bg-white border border-[#e5e0d8] rounded-2xl shadow-sm overflow-visible">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create..."
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-[#1a1a1a] placeholder-[#6b6b6b] outline-none px-4 pt-4 pb-2 min-h-[90px]"
              disabled={isGenerating}
            />
            {uploadedImage && (
              <div className="px-4 pb-2">
                <div className="relative inline-block">
                  <img src={uploadedImage} alt="Uploaded" className="w-14 h-14 object-cover rounded-lg border border-[#e5e0d8]" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white rounded-full text-xs flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: GREEN }}
                  >×</button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 px-3 pb-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="flex items-center justify-center w-8 h-8 rounded-full text-[#6b6b6b] hover:bg-[#f0ece5] transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              </label>
              <button onClick={toggleMode} className="text-xs font-medium px-2.5 py-1.5 rounded-full hover:bg-[#f0ece5] transition-colors cursor-pointer" style={{ color: GREEN }}>
                {mode === "agent" ? "Agent" : "Copilot"}
              </button>
              <div ref={settingsRef} className="relative">
                <button onClick={() => setSettingsOpen(!settingsOpen)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-[#f0ece5] transition-colors cursor-pointer text-[#6b6b6b]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.51a2 2 0 011-1.72l.15-.1a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                  <span>{settingsSummary}</span>
                </button>
                {settingsOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-[#e5e0d8] rounded-2xl shadow-lg p-4 z-50">
                    <div className="flex items-center gap-1 bg-[#eae5dc] rounded-full p-1 mb-3 w-fit">
                      {(["image", "video"] as GenTab[]).map((t) => (
                        <button key={t} onClick={() => setGenTab(t)} className={`text-xs font-medium py-1.5 px-4 rounded-full transition-all cursor-pointer capitalize ${genTab === t ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>{t}</button>
                      ))}
                    </div>
                    {genTab === "image" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-12 flex-shrink-0">Images</span>
                          <div className="flex gap-1">
                            {([1, 2, 4] as ImageCount[]).map((n) => (
                              <button key={n} onClick={() => setImageCount(n)} className={`w-8 h-7 text-xs rounded-lg transition-all cursor-pointer ${imageCount === n ? greenBtnSelected : greenBtnUnselected}`} style={imageCount === n ? { backgroundColor: GREEN } : undefined}>{n}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-12 flex-shrink-0 pt-1">Ratio</span>
                          <div className="flex flex-wrap gap-1">
                            {[{ label: "Auto", w: 0, h: 0 },{ label: "1:1", w: 1, h: 1 },{ label: "4:5", w: 4, h: 5 },{ label: "3:4", w: 3, h: 4 },{ label: "2:3", w: 2, h: 3 },{ label: "9:16", w: 9, h: 16 },{ label: "5:4", w: 5, h: 4 },{ label: "4:3", w: 4, h: 3 },{ label: "3:2", w: 3, h: 2 },{ label: "16:9", w: 16, h: 9 },{ label: "2:1", w: 2, h: 1 },{ label: "21:9", w: 21, h: 9 }].map((r) => {
                              const sel = ratio === r.label;
                              return (
                                <button key={r.label} onClick={() => setRatio(r.label)} title={r.label} className={`flex items-center justify-center w-8 h-7 rounded-lg transition-all cursor-pointer ${sel ? greenBtnSelected : greenBtnUnselected}`} style={sel ? { backgroundColor: GREEN } : undefined}>
                                  {r.label === "Auto" ? (
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" /></svg>
                                  ) : (
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x={(18 - 14 * r.w / Math.max(r.w, r.h)) / 2} y={(18 - 14 * r.h / Math.max(r.w, r.h)) / 2} width={14 * r.w / Math.max(r.w, r.h)} height={14 * r.h / Math.max(r.w, r.h)} rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-12 flex-shrink-0">Res</span>
                          <div className="flex gap-1">
                            {(["1k", "2k", "4k"] as ImageResolution[]).map((r) => (
                              <button key={r} onClick={() => setImageResolution(r)} className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${imageResolution === r ? greenBtnSelected : greenBtnUnselected}`} style={imageResolution === r ? { backgroundColor: GREEN } : undefined}>{r.toUpperCase()}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {genTab === "video" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-12 flex-shrink-0">Res</span>
                          <div className="flex gap-1">
                            {(["auto", "480p", "720p"] as VideoResolution[]).map((r) => (
                              <button key={r} onClick={() => setVideoResolution(r)} className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${videoResolution === r ? greenBtnSelected : greenBtnUnselected}`} style={videoResolution === r ? { backgroundColor: GREEN } : undefined}>{r === "auto" ? "Auto" : r}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-12 flex-shrink-0">Ratio</span>
                          <div className="flex gap-1">
                            {(["auto", "1:1", "4:3", "3:4", "16:9", "9:16"] as string[]).map((r) => (
                              <button key={r} onClick={() => setRatio(r)} className={`text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${ratio === r ? greenBtnSelected : greenBtnUnselected}`} style={ratio === r ? { backgroundColor: GREEN } : undefined}>{r === "auto" ? "Auto" : r}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b6b6b] uppercase tracking-wider w-12 flex-shrink-0">Duration</span>
                          <div className="flex gap-1">
                            {(["auto", "4s", "5s", "6s", "8s", "10s", "15s"] as Duration[]).map((d) => (
                              <button key={d} onClick={() => setDuration(d)} className={`text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${duration === d ? greenBtnSelected : greenBtnUnselected}`} style={duration === d ? { backgroundColor: GREEN } : undefined}>{d === "auto" ? "Auto" : d}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Skills Button */}
              <div ref={skillsRef} className="relative">
                <button onClick={() => setSkillsOpen(!skillsOpen)} className="flex items-center justify-center w-7 h-7 rounded-full transition-colors cursor-pointer" style={{ color: selectedSkill ? GREEN : "#9ca3af" }} title="Skills">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5A2.5 2.5 0 014 19.5z" /><path d="M8 7h6M8 11h8M8 15h5" /></svg>
                </button>
                {skillsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-[#e5e0d8] rounded-2xl shadow-lg p-2 z-50 max-h-64 overflow-y-auto">
                    {SKILLS.map((skill) => {
                      const isSelected = selectedSkill === skill.id;
                      return (
                        <button key={skill.id} onClick={() => setSelectedSkill(isSelected ? null : skill.id)} className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${isSelected ? "text-white font-medium" : "text-[#1a1a1a] hover:bg-[#f5f2ed]"}`} style={isSelected ? { backgroundColor: GREEN } : undefined}>
                          <div className="font-medium">{skill.name}</div>
                          <div className={isSelected ? "opacity-80" : "text-[#6b6b6b]"} style={{ fontSize: "10px" }}>{skill.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex-1" />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                style={{ backgroundColor: GREEN }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
            </div>
          </div>

          {/* "What DotDraw can make" */}
          <p className="w-full text-left text-sm font-semibold text-[#5a5a5a] mt-8 mb-4">
            What DotDraw can make
          </p>

          {/* Quick Cards */}
          <div className="w-full grid grid-cols-2 gap-3">
            {SUGGESTION_CARDS.map((card) => {
              return (
                <button
                  key={card.title}
                  onClick={() => handleCardClick(card.prompt)}
                  className="text-left bg-white rounded-xl border border-[#e5e0d8] overflow-hidden transition-all cursor-pointer hover:border-[#10B981] hover:shadow-sm group"
                >
                  {/* Background image area with icon */}
                  <div
                    className="h-16 flex items-center justify-center transition-colors"
                    style={{ backgroundColor: card.bg }}
                  >
                    <span style={{ color: card.iconColor }}>
                      {card.icon}
                    </span>
                  </div>
                  {/* Title + Subtitle */}
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{card.title}</p>
                    <p className="text-xs text-[#6b6b6b] mt-0.5">{card.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      ) : (
        /* Chat Input Bar (after messages started) */
        <div className="border-t border-[#e5e0d8] p-4 bg-white/50">
          <div className="bg-white border border-[#e5e0d8] rounded-2xl shadow-sm overflow-visible">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe what you want to create..." rows={1} className="w-full resize-none bg-transparent text-sm text-[#1a1a1a] placeholder-[#6b6b6b] outline-none px-4 pt-3 pb-1 min-h-[44px]" disabled={isGenerating} />
            <div className="flex items-center gap-1 px-3 pb-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload-chat" />
              <label htmlFor="file-upload-chat" className="flex items-center justify-center w-8 h-8 rounded-full text-[#6b6b6b] hover:bg-[#f0ece5] transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              </label>
              <button onClick={toggleMode} className="text-xs font-medium px-2.5 py-1.5 rounded-full hover:bg-[#f0ece5] transition-colors cursor-pointer" style={{ color: GREEN }}>{mode === "agent" ? "Agent" : "Copilot"}</button>
              <div ref={settingsRef} className="relative">
                <button onClick={() => setSettingsOpen(!settingsOpen)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full hover:bg-[#f0ece5] transition-colors cursor-pointer text-[#6b6b6b]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.09a2 2 0 01-1-1.74v-.51a2 2 0 011-1.72l.15-.1a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                  <span>{settingsSummary}</span>
                </button>
              </div>

              {/* Skills Button */}
              <div ref={skillsRef} className="relative">
                <button onClick={() => setSkillsOpen(!skillsOpen)} className="flex items-center justify-center w-7 h-7 rounded-full transition-colors cursor-pointer" style={{ color: selectedSkill ? GREEN : "#9ca3af" }} title="Skills">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5A2.5 2.5 0 014 19.5z" /><path d="M8 7h6M8 11h8M8 15h5" /></svg>
                </button>
                {skillsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-[#e5e0d8] rounded-2xl shadow-lg p-2 z-50 max-h-64 overflow-y-auto">
                    {SKILLS.map((skill) => {
                      const isSelected = selectedSkill === skill.id;
                      return (
                        <button key={skill.id} onClick={() => setSelectedSkill(isSelected ? null : skill.id)} className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${isSelected ? "text-white font-medium" : "text-[#1a1a1a] hover:bg-[#f5f2ed]"}`} style={isSelected ? { backgroundColor: GREEN } : undefined}>
                          <div className="font-medium">{skill.name}</div>
                          <div className={isSelected ? "opacity-80" : "text-[#6b6b6b]"} style={{ fontSize: "10px" }}>{skill.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex-1" />
              <button onClick={handleSend} disabled={!input.trim() || isGenerating} className="flex-shrink-0 w-9 h-9 rounded-full text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer" style={{ backgroundColor: GREEN }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for tool call chips with expand/collapse
function ToolCallChips({ chips }: { chips: ToolCallState[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mt-2 space-y-1.5">
      {chips.map((tc) => {
        const expanded = expandedIds.has(tc.id);
        const hasDetail = !!(tc.thinkingText || tc.message);
        return (
          <div key={tc.id}>
            <button
              onClick={() => hasDetail && toggle(tc.id)}
              className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg w-full text-left transition-colors ${
                hasDetail ? "cursor-pointer" : "cursor-default"
              } ${
                tc.name === "thinking"
                  ? "bg-[#faf8f5] border border-[#e5e0d8]"
                  : "bg-[#f0faf5] border border-[#d1fae5]"
              }`}
            >
              {tc.status === "running" ? (
                tc.name === "thinking" ? (
                  <span className="w-3 h-3 rounded-full border-2 border-[#6b6b6b] border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <span className="w-3 h-3 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin flex-shrink-0" />
                )
              ) : tc.status === "failed" ? (
                <span className="text-red-500 flex-shrink-0">✕</span>
              ) : (
                <span className="text-[#10B981] flex-shrink-0">✓</span>
              )}
              <span className="text-[#1a1a1a] flex-1">{tc.displayName || tc.name}</span>
              {hasDetail && (
                <svg
                  className={`w-3 h-3 text-[#6b6b6b] flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {expanded && hasDetail && (
              <div className="mt-1 ml-6 pl-3 py-2 border-l-2 border-[#e5e0d8] text-xs text-[#6b6b6b] whitespace-pre-wrap leading-relaxed">
                {tc.thinkingText || tc.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
