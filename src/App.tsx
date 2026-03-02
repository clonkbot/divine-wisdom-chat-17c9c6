import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ChatInterface } from "./components/ChatInterface";
import { Sidebar } from "./components/Sidebar";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzAgMEwzMCA2MCIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjE1LCAwLCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxwYXRoIGQ9Ik0wIDMwTDYwIDMwIiBzdHJva2U9InJnYmEoMjU1LCAyMTUsIDAsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50" />
        <div className="text-center z-10">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-2 border-amber-500/50 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 border-2 border-amber-400/30 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 flex items-center justify-center">
                <span className="text-3xl md:text-4xl">✝️</span>
              </div>
            </div>
          </div>
          <p className="text-amber-200/80 font-serif text-lg md:text-xl tracking-wide">Seeking wisdom...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwgMjE1LCAwLCAwLjA1KSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none" />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-amber-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-amber-200/80 hover:text-amber-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-serif text-lg text-amber-200 tracking-wide">Divine Wisdom</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 pt-14 lg:pt-0">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-out
          w-72 lg:w-80
        `}>
          <Sidebar
            selectedConversation={selectedConversation}
            onSelectConversation={(id) => {
              setSelectedConversation(id);
              setSidebarOpen(false);
            }}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            conversationId={selectedConversation}
            onNewConversation={setSelectedConversation}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center border-t border-amber-500/10 bg-[#0a0a0f]/80 backdrop-blur-sm">
        <p className="text-[10px] md:text-xs text-amber-200/30 font-mono tracking-wider">
          Requested by <span className="text-amber-300/40">@web-user</span> · Built by <span className="text-amber-300/40">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
