"use client";

import { useState } from "react";

interface ShowcaseItem {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  category: "inspiration" | "showcase";
}

// Placeholder showcase data - you can replace these with your own examples
const DEFAULT_SHOWCASE: ShowcaseItem[] = [
  {
    id: "1",
    title: "Minimalist Logo Design",
    author: "AI Generated",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop",
    category: "showcase",
  },
  {
    id: "2",
    title: "Product Poster",
    author: "AI Generated",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop",
    category: "showcase",
  },
  {
    id: "3",
    title: "Brand Identity Kit",
    author: "AI Generated",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    category: "showcase",
  },
  {
    id: "4",
    title: "Social Media Template",
    author: "AI Generated",
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
    category: "showcase",
  },
  {
    id: "5",
    title: "Nature Photography",
    author: "Unsplash",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop",
    category: "inspiration",
  },
  {
    id: "6",
    title: "Architecture Render",
    author: "Unsplash",
    imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop",
    category: "inspiration",
  },
  {
    id: "7",
    title: "Abstract Art",
    author: "Unsplash",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop",
    category: "inspiration",
  },
  {
    id: "8",
    title: "Interior Design",
    author: "Unsplash",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop",
    category: "inspiration",
  },
];

type Tab = "inspiration" | "showcase";

export default function ShowcasePanel() {
  const [activeTab, setActiveTab] = useState<Tab>("showcase");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = DEFAULT_SHOWCASE.filter(
    (item) =>
      item.category === activeTab &&
      (searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#faf8f5]">
      {/* Header with Tabs */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-1 bg-[#eae5dc] rounded-full p-1">
          <button
            onClick={() => setActiveTab("showcase")}
            className={`flex-1 text-sm font-medium py-2 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === "showcase"
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => setActiveTab("inspiration")}
            className={`flex-1 text-sm font-medium py-2 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === "inspiration"
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
          >
            Inspiration
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#e5e0d8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1a1a1a] placeholder-[#6b6b6b] outline-none focus:border-[#1a1a1a] transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#6b6b6b]">
            <p className="text-sm">No results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#e5e0d8] mb-2">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-medium text-[#1a1a1a] truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6b6b6b]">{item.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
