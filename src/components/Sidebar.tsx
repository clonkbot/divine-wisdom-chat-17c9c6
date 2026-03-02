import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface SidebarProps {
  selectedConversation: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations"> | null) => void;
  onCloseMobile: () => void;
}

export function Sidebar({ selectedConversation, onSelectConversation, onCloseMobile }: SidebarProps) {
  const { signOut } = useAuthActions();
  const conversations = useQuery(api.conversations.list);
  const createConversation = useMutation(api.conversations.create);
  const deleteConversation = useMutation(api.conversations.remove);

  const handleNewChat = async () => {
    const id = await createConversation({ title: "New Conversation" });
    onSelectConversation(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"conversations">) => {
    e.stopPropagation();
    await deleteConversation({ id });
    if (selectedConversation === id) {
      onSelectConversation(null);
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#0d0d14] to-[#08080c] border-r border-amber-500/15 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/15">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <h1 className="font-serif text-lg text-amber-100 tracking-wide hidden sm:block">Divine Wisdom</h1>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-amber-200/60 hover:text-amber-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full py-3 bg-gradient-to-r from-amber-600/20 to-amber-700/20 hover:from-amber-600/30 hover:to-amber-700/30 border border-amber-500/30 rounded-xl text-amber-200 font-medium transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {conversations === undefined ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-amber-200/40 text-sm">No conversations yet</p>
            <p className="text-amber-200/30 text-xs mt-1">Start a new chat to receive wisdom</p>
          </div>
        ) : (
          conversations.map((conv: { _id: Id<"conversations">; title: string; updatedAt: number }) => (
            <div
              key={conv._id}
              onClick={() => onSelectConversation(conv._id)}
              className={`group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedConversation === conv._id
                  ? "bg-amber-500/15 border border-amber-500/30"
                  : "hover:bg-amber-500/10 border border-transparent"
              }`}
            >
              <span className="text-lg opacity-60">💬</span>
              <div className="flex-1 min-w-0">
                <p className="text-amber-100/90 text-sm truncate">{conv.title}</p>
                <p className="text-amber-200/30 text-xs">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv._id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-amber-200/40 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-amber-500/15">
        <div className="flex items-center gap-2 mb-3 px-2">
          <span className="text-lg">✝️</span>
          <span className="text-amber-200/40 text-xs font-serif italic flex-1">Faith & Freedom</span>
          <span className="text-lg">🦅</span>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full py-2.5 bg-transparent border border-amber-500/20 hover:border-red-500/40 rounded-lg text-amber-200/60 hover:text-red-400 text-sm transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
