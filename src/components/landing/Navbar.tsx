"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/80 backdrop-blur-sm border-b border-[#e5e0d8]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-lg font-semibold text-[#1a1a1a] tracking-tight">
            DotDraw
          </span>
        </Link>

        {/* CTA */}
        <Link
          href="/signup"
          className="text-sm bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors font-medium"
        >
          Start Creating
        </Link>
      </div>
    </nav>
  );
}
