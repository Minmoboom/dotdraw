"use client";

import { useState } from "react";
import Link from "next/link";

export interface ShowcaseItem {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  category: "inspiration" | "showcase";
  prompt: string;
  type: "image" | "video";
  height: number;
  response?: string;
}

// Picsum Photos — free beautiful images, accessible in China
const img = (id: string) => `/showcase/${id}.png`;

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { id:"1", title:"Artisan Coffee Brand Logo", author:"Minmo", imageUrl:img("1"), category:"showcase", type:"image", prompt:"Design a brand logo for an artisan coffee roaster.", height:500 },
  { id:"2", title:"Jazz Night Event Poster", author:"Minmo", imageUrl:img("2"), category:"showcase", type:"image", prompt:"Design an event poster for a late-night jazz show.", height:320 },
  { id:"3", title:"Meditation App Home Screen", author:"Minmo", imageUrl:img("3"), category:"showcase", type:"image", prompt:"Design a mobile app home screen for a meditation app.", height:560 },
  { id:"4", title:"Risograph Photo Remix", author:"Minmo", imageUrl:img("4"), category:"showcase", type:"image", prompt:"Remix a photo into a bold risograph poster.", height:380 },
  { id:"5", title:"Fashion Brand Moodboard", author:"Minmo", imageUrl:img("5"), category:"showcase", type:"image", prompt:"Create a moodboard for a sustainable fashion brand.", height:450 },
  { id:"6", title:"Abstract Geometric Poster", author:"Minmo", imageUrl:img("6"), category:"showcase", type:"image", prompt:"Design an abstract geometric poster.", height:350 },
  { id:"7", title:"Sculptural Ceramic Vase", author:"Minmo", imageUrl:img("7"), category:"showcase", type:"image", prompt:"A sculptural ceramic vase with organic curves.", height:520 },
  { id:"8", title:"Neon Typography Sign", author:"Minmo", imageUrl:img("8"), category:"showcase", type:"image", prompt:"A neon typography sign for a bar.", height:340 },
  { id:"9", title:"Matcha Packaging Design", author:"Minmo", imageUrl:img("9"), category:"showcase", type:"image", prompt:"Minimalist matcha tea packaging.", height:480 },
  { id:"10", title:"Vintage Travel Poster", author:"Minmo", imageUrl:img("10"), category:"showcase", type:"image", prompt:"A vintage travel poster for Santorini.", height:410 },
  { id:"11", title:"Minimalist Interior Render", author:"Minmo", imageUrl:img("11"), category:"inspiration", type:"image", prompt:"Render a minimalist Japanese interior.", height:470 },
  { id:"12", title:"Sunset Mountain Landscape", author:"Minmo", imageUrl:img("12"), category:"inspiration", type:"image", prompt:"Dramatic sunset over mountain peaks.", height:330 },
  { id:"13", title:"Modern Brutalist Architecture", author:"Minmo", imageUrl:img("13"), category:"inspiration", type:"image", prompt:"Modern concrete architecture.", height:500 },
  { id:"14", title:"Fluid Abstract Art", author:"Minmo", imageUrl:img("14"), category:"inspiration", type:"image", prompt:"Fluid abstract art with pink and blue.", height:360 },
  { id:"15", title:"Clean Product Photography", author:"Minmo", imageUrl:img("15"), category:"inspiration", type:"image", prompt:"Clean product photo on white.", height:420 },
  { id:"16", title:"Botanical Watercolor", author:"Minmo", imageUrl:img("16"), category:"inspiration", type:"image", prompt:"Delicate watercolor botanical.", height:510 },
  { id:"17", title:"Pastry Shop Branding", author:"Minmo", imageUrl:img("17"), category:"showcase", type:"image", prompt:"Branding kit for a French pastry shop.", height:370 },
  { id:"18", title:"Dark Mode Dashboard", author:"Minmo", imageUrl:img("18"), category:"showcase", type:"image", prompt:"Dark mode analytics dashboard UI.", height:460 },
  { id:"19", title:"Street Fashion Editorial", author:"Minmo", imageUrl:img("19"), category:"inspiration", type:"image", prompt:"Street fashion editorial shoot.", height:530 },
  { id:"20", title:"Ceramic Tableware Set", author:"Minmo", imageUrl:img("20"), category:"inspiration", type:"image", prompt:"Handcrafted ceramic tableware.", height:390 },
];

type Tab = "inspiration" | "showcase";

export default function ShowcasePanel() {
  const [activeTab, setActiveTab] = useState<Tab>("showcase");

  const filteredItems = SHOWCASE_ITEMS.filter((item) => item.category === activeTab);

  return (
    <div className="flex flex-col h-full bg-[#faf8f5]">
      {/* Header: Discovery + Tabs */}
      <div className="px-6 pt-6 pb-2 flex items-center gap-4">
        <span className="text-sm font-semibold text-[#1a1a1a] flex-shrink-0">Discovery</span>
        <div className="flex items-center gap-1 bg-[#eae5dc] rounded-full p-1">
          <button
            onClick={() => setActiveTab("showcase")}
            className={`flex-1 text-sm font-medium py-2 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === "showcase"
                ? "bg-white shadow-sm"
                : "text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
            style={activeTab === "showcase" ? { color: "#10B981" } : undefined}
          >
            Showcase
          </button>
          <button
            onClick={() => setActiveTab("inspiration")}
            className={`flex-1 text-sm font-medium py-2 px-4 rounded-full transition-all cursor-pointer ${
              activeTab === "inspiration"
                ? "bg-white shadow-sm"
                : "text-[#6b6b6b] hover:text-[#1a1a1a]"
            }`}
            style={activeTab === "inspiration" ? { color: "#10B981" } : undefined}
          >
            Inspiration
          </button>
        </div>
      </div>

      {/* Masonry Grid - 4 columns */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="columns-4 gap-3 space-y-3">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/showcase/${item.id}`} className="block break-inside-avoid group cursor-pointer">
              <div className="relative rounded-xl overflow-hidden bg-[#e5e0d8] mb-2">
                <img
                  src={item.imageUrl} alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy" style={{ aspectRatio: `400/${item.height}` }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-[13px] font-medium text-[#1a1a1a] truncate leading-tight">{item.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">M</span>
                </div>
                <p className="text-[11px] text-[#6b6b6b]">{item.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
