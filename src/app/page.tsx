import ChatPanel from "@/components/ChatPanel";
import ShowcasePanel from "@/components/ShowcasePanel";
import AuthNav from "@/components/AuthNav";
import ChatHeader from "@/components/ChatHeader";
import { ConversationProvider } from "@/context/ConversationContext";

export default function Home() {
  return (
    <ConversationProvider>
      <div className="flex flex-col h-screen bg-[#faf8f5]">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-[#e5e0d8] bg-white/50 flex-shrink-0">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#10B981" }}>
              <span className="text-white text-xs font-bold italic">D</span>
            </div>
            <span className="text-lg font-semibold text-[#1a1a1a] tracking-tight">
              DotDraw
            </span>
          </a>
          <AuthNav />
        </header>

        {/* Main Content: Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Chat */}
          <div className="w-[45%] min-w-[360px] border-r border-[#e5e0d8] flex flex-col">
            <ChatHeader />
            <ChatPanel />
          </div>

          {/* Right Panel: Showcase */}
          <div className="flex-1 flex flex-col">
            <ShowcasePanel />
          </div>
        </div>
      </div>
    </ConversationProvider>
  );
}
