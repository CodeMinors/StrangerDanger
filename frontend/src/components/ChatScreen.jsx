import { useState, useRef, useEffect } from "react";
import { ShieldCheck, Ban, Flag, Power, Send } from "lucide-react";
import AnalysisPanel from "./AnalysisPanel";

export default function ChatScreen({ platformType, messages, analysis, onSend, onEnd, loading }) {
  const [input, setInput] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setShowAnalysis(false);
    onSend(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const title = platformType === "social_media" ? "Social Media" : "Gaming Platform";

  return (
    <div data-testid="chat-screen" className="h-screen flex flex-col bg-[#06070A]">
      {/* Header */}
      <header className="bg-[#101218] border-b border-[#222631] px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
          <h1 data-testid="chat-title" className="font-['Azeret_Mono'] text-sm font-bold tracking-tight uppercase">
            {title} — Safety Trainer
          </h1>
          <div className="flex items-center gap-1.5 ml-3">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            <span className="text-xs text-[#8B949E] font-['Azeret_Mono'] tracking-wider uppercase">Live</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="block-btn"
            onClick={() => onEnd("block")}
            disabled={loading}
            className="bg-transparent border border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000] hover:text-black transition-colors px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Ban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Block</span>
          </button>
          <button
            data-testid="report-btn"
            onClick={() => onEnd("report")}
            disabled={loading}
            className="bg-transparent border border-[#FF2A55] text-[#FF2A55] hover:bg-[#FF2A55] hover:text-white transition-colors px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
          <button
            data-testid="end-btn"
            onClick={() => onEnd("end")}
            disabled={loading}
            className="bg-transparent border border-[#222631] text-[#8B949E] hover:bg-[#181A22] hover:text-white transition-colors px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Power className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col border-r border-[#222631]">
          <div data-testid="messages-container" className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {msg.role === "assistant" ? (
                  <div className="max-w-[80%] border-l-2 border-[#00E5FF] pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src="https://images.unsplash.com/photo-1534294668821-28a3054f4256?w=40&h=40&fit=crop&crop=face"
                        alt="stranger"
                        className="w-5 h-5 grayscale object-cover"
                      />
                      <span className="text-[10px] font-bold text-[#5B6471] tracking-[0.2em] uppercase font-['Azeret_Mono']">
                        Stranger
                      </span>
                    </div>
                    <p data-testid={`message-bot-${i}`} className="text-[#8B949E] text-sm leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="max-w-[80%] bg-[#181A22] border border-[#222631] px-4 py-3">
                    <p data-testid={`message-user-${i}`} className="text-white text-sm leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="border-l-2 border-[#00E5FF] pl-4 py-2 flex gap-1">
                  <span className="w-2 h-2 bg-[#5B6471] rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-[#5B6471] rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-[#5B6471] rounded-full typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#222631] p-3 lg:p-4 flex gap-3">
            <textarea
              data-testid="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-[#101218] border border-[#222631] text-white px-4 py-3 text-sm resize-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] focus:outline-none transition-all disabled:opacity-50 font-['IBM_Plex_Sans']"
            />
            <button
              data-testid="send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#00E5FF] text-black w-12 h-12 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analysis Panel */}
        <AnalysisPanel
          analysis={analysis}
          showAnalysis={showAnalysis}
          onToggle={() => setShowAnalysis(!showAnalysis)}
        />
      </div>
    </div>
  );
}
