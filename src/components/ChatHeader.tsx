"use client";

import { useState, useRef, useEffect } from "react";
import { useConversation } from "@/context/ConversationContext";
import { groupConversationsByMonth } from "@/lib/conversations";

export default function ChatHeader() {
  const {
    currentTitle,
    conversations,
    switchConversation,
    newConversation,
    renameConversation,
    deleteConversation,
    currentId,
    isLoggedIn,
  } = useConversation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const groups = groupConversationsByMonth(conversations);

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-[#e5e0d8]">
      {/* Title + Dropdown */}
      <div ref={dropdownRef} className="relative flex items-center gap-1">
        <span className="text-sm font-semibold text-[#1a1a1a] truncate max-w-[180px]">
          {currentTitle}
        </span>
        <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-5 h-5 rounded hover:bg-[#e5e0d8] transition-colors cursor-pointer"
          >
            <svg
              className={`w-3 h-3 text-[#6b6b6b] transition-transform ${open ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#e5e0d8] rounded-2xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {!isLoggedIn ? (
              <div className="px-4 py-6 text-center text-xs text-[#6b6b6b]">
                Sign in to save conversations
              </div>
            ) : groups.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#6b6b6b]">
                No conversations yet
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label}>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                    {group.label}
                  </div>
                  {group.items.map((conv) => (
                    <div
                      key={conv.id}
                      className={`flex items-center group ${
                        conv.id === currentId ? "bg-[#ECFDF5]" : "hover:bg-[#f5f2ed]"
                      }`}
                    >
                      {editingId === conv.id ? (
                        <input
                          ref={editInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              renameConversation(conv.id, editValue);
                              setEditingId(null);
                            }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          onBlur={() => setEditingId(null)}
                          className="flex-1 mx-3 my-1 px-2 py-1 text-sm border border-[#10B981] rounded-lg outline-none"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => { switchConversation(conv.id); setOpen(false); }}
                          className={`flex-1 text-left px-4 py-2 text-sm truncate cursor-pointer ${
                            conv.id === currentId ? "text-[#10B981] font-medium" : "text-[#1a1a1a]"
                          }`}
                        >
                          {conv.title}
                        </button>
                      )}
                      {/* Edit + Delete icons (show on hover) */}
                      <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(conv.id);
                            setEditValue(conv.title);
                            setTimeout(() => editInputRef.current?.focus(), 50);
                          }}
                          className="p-1 rounded hover:bg-[#e5e0d8] cursor-pointer"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6b6b6b]">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this conversation?")) {
                              deleteConversation(conv.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-[#e5e0d8] cursor-pointer"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6b6b6b] hover:text-red-500">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* New Chat Button */}
      <button
        onClick={newConversation}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#e5e0d8] transition-colors cursor-pointer"
        title="New Chat"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b6b6b]">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
          <line x1="12" y1="7" x2="12" y2="13" />
        </svg>
      </button>
    </div>
  );
}
