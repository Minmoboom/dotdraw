import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 text-center bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p className="text-sm font-medium text-[#6b6b6b] mb-6 tracking-wide uppercase">
          AI Design Agent
        </p>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#1a1a1a] leading-[1.1] tracking-tight mb-6">
          One Agent.
          <br />
          Every Creative Tool.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6b6b6b] max-w-2xl mx-auto leading-relaxed mb-10">
          DotDraw is an autonomous design agent. In one conversation it does
          text-to-image, text-to-video, and text-to-3D, plus image & video editing,
          presentation slides, and full web prototype generation — all on an
          infinite canvas.
        </p>

        {/* CTA Button */}
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white text-base font-medium px-8 py-3.5 rounded-full hover:bg-[#333] transition-colors"
        >
          Explore Showcase
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
