import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatInterfaceProps {
  conversationId: Id<"conversations"> | null;
  onNewConversation: (id: Id<"conversations">) => void;
}

export function ChatInterface({ conversationId, onNewConversation }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useQuery(
    api.messages.listByConversation,
    conversationId ? { conversationId } : "skip"
  );
  const createConversation = useMutation(api.conversations.create);
  const addUserMessage = useMutation(api.messages.addUserMessage);
  const updateTitle = useMutation(api.conversations.updateTitle);
  const generateResponse = useAction(api.messages.generateResponse);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    setIsGenerating(true);

    try {
      let currentConversationId: Id<"conversations"> = conversationId as Id<"conversations">;

      // Create new conversation if needed
      if (!conversationId) {
        currentConversationId = await createConversation({
          title: userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
        });
        onNewConversation(currentConversationId);
      }

      // Add user message
      await addUserMessage({
        conversationId: currentConversationId,
        content: userMessage,
      });

      // Generate AI response
      await generateResponse({
        conversationId: currentConversationId,
        userMessage,
      });

      // Update title if it's a new conversation
      if (!conversationId) {
        const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? "..." : "");
        await updateTitle({ id: currentConversationId, title });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!conversationId || (messages && messages.length === 0) ? (
          <div className="h-full flex items-center justify-center p-4 md:p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6 md:mb-8">
                <div className="relative inline-block">
                  <span className="text-6xl md:text-7xl lg:text-8xl">📖</span>
                  <span className="absolute -top-2 -right-2 md:-top-4 md:-right-4 text-2xl md:text-3xl animate-bounce" style={{ animationDuration: '2s' }}>✨</span>
                </div>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-amber-100 mb-4 tracking-wide">
                Seek and You Shall Find
              </h2>
              <p className="text-amber-200/60 text-sm md:text-base lg:text-lg mb-6 md:mb-8 font-light leading-relaxed max-w-lg mx-auto px-4">
                Ask anything, and receive wisdom from Scripture and the words of America's Founding Fathers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto px-4">
                {[
                  "What does the Bible say about courage?",
                  "Tell me about liberty and freedom",
                  "How should I handle difficult times?",
                  "What is true wisdom?",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-2.5 md:px-4 md:py-3 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-amber-200/70 hover:text-amber-100 text-xs md:text-sm text-left transition-all duration-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            {messages?.map((message: { _id: string; role: "user" | "assistant"; content: string; createdAt: number }) => (
              <div
                key={message._id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[85%] ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-amber-600/30 to-amber-700/30 border border-amber-500/30 rounded-2xl rounded-br-md"
                      : "bg-gradient-to-br from-[#15151f] to-[#101018] border border-amber-500/15 rounded-2xl rounded-bl-md"
                  } p-3 md:p-4 lg:p-5`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <span className="text-lg md:text-xl">📜</span>
                      <span className="text-amber-300/80 font-serif text-xs md:text-sm">Divine Wisdom</span>
                    </div>
                  )}
                  <div
                    className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                      message.role === "user" ? "text-amber-100" : "text-amber-100/90"
                    }`}
                  >
                    {formatMessage(message.content)}
                  </div>
                  <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-amber-200/30">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-[#15151f] to-[#101018] border border-amber-500/15 rounded-2xl rounded-bl-md p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg md:text-xl">📜</span>
                    <span className="text-amber-300/80 font-serif text-xs md:text-sm">Divine Wisdom</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-200/60">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs md:text-sm font-serif italic">Seeking wisdom...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-amber-500/15 bg-gradient-to-t from-[#0a0a0f] to-transparent p-3 md:p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask for wisdom from Scripture and the Founders..."
              rows={1}
              className="w-full px-4 md:px-5 py-3 md:py-4 pr-14 md:pr-16 bg-[#12121a] border border-amber-500/20 rounded-xl md:rounded-2xl text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none text-sm md:text-base"
              style={{ minHeight: "48px", maxHeight: "200px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="absolute right-2 md:right-3 bottom-2 md:bottom-3 p-2 md:p-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-lg md:rounded-xl text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-amber-600 disabled:hover:to-amber-700"
            >
              {isGenerating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-2 md:mt-3 text-center text-[10px] md:text-xs text-amber-200/30 font-light">
            Press Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

function formatMessage(content: string): React.ReactNode {
  // Simple markdown-like formatting
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-amber-200 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
