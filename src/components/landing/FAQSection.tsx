"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Which model powers DotDraw's images?",
    a: "Text-to-image uses Wanx 2.1, supporting posters, product shots, and illustrations up to 4K resolution.",
  },
  {
    q: "Can DotDraw generate videos?",
    a: "Yes — video generation is coming soon with cinematic transitions and sound effects.",
  },
  {
    q: "Can it create 3D models?",
    a: "Yes — 3D model generation is on our roadmap, producing rotatable assets from text and images.",
  },
  {
    q: "Does it build web pages?",
    a: "Yes — describe a product and DotDraw generates a complete, coded web prototype.",
  },
  {
    q: "How does the AI agent work?",
    a: "Domi is an autonomous design agent: it understands your brief, picks the right tool, and iterates until the result is right.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — DotDraw has a free tier with credits. Paid plans unlock video, 3D, and priority generation.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#6b6b6b] mb-4 tracking-wide uppercase">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="border border-[#e5e0d8] rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#faf8f5] transition-colors cursor-pointer"
              >
                <span className="text-[#1a1a1a] font-medium pr-4">
                  {faq.q}
                </span>
                <svg
                  className={`w-5 h-5 text-[#6b6b6b] flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-sm text-[#6b6b6b] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
