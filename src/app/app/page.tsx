import ChatPanel from "@/components/ChatPanel";
import ShowcasePanel from "@/components/ShowcasePanel";
import AuthNav from "@/components/AuthNav";

export default function AppPage() {
  return (
    <div className="flex flex-col h-screen bg-[#faf8f5]">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#e5e0d8] bg-white/50 flex-shrink-0">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-lg font-semibold text-[#1a1a1a] tracking-tight">
            DotDraw
          </span>
        </a>
        <AuthNav />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[45%] min-w-[360px] border-r border-[#e5e0d8] flex flex-col">
          <ChatPanel />
        </div>
        <div className="flex-1 flex flex-col">
          <ShowcasePanel />
        </div>
      </div>
    </div>
  );
}
