"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const SUGGESTIONS = [
  "Generate a logo for a coffee shop",
  "Design a poster for a music festival",
  "Create a moodboard for a fashion brand",
  "Make an illustration of a futuristic city",
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI design assistant. Describe what you want to create, and I'll bring it to life. You can ask me for logos, posters, illustrations, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      // Call our API route
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Here's what I created based on your request: "${userMessage.content}"`,
        imageUrl: data.imageUrl,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I couldn't generate the image. " +
          (error.message || "Please try again with a different description."),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  return (
    <div className="flex flex-col h-full bg-[#faf8f5]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white border border-[#e5e0d8] text-[#1a1a1a]"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Generated"
                  className="mt-3 rounded-lg w-full"
                />
              )}
            </div>
          </div>
        ))}

        {/* Generating indicator */}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e5e0d8] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#6b6b6b] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-[#6b6b6b] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#6b6b6b] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (shown when no user messages yet) */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3">
          <p className="text-xs text-[#6b6b6b] mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs text-[#1a1a1a] bg-white border border-[#e5e0d8] rounded-full px-3 py-1.5 hover:bg-[#f5f2ed] transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[#e5e0d8] p-4 bg-white/50">
        <div className="flex items-end gap-3 bg-white border border-[#e5e0d8] rounded-2xl px-4 py-3 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[#1a1a1a] placeholder-[#6b6b6b] outline-none max-h-[120px]"
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
