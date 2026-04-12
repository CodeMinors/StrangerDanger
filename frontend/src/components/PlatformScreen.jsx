import { ShieldCheck, MessageCircle, Gamepad2 } from "lucide-react";

export default function PlatformScreen({ onSelect, loading }) {
  return (
    <div data-testid="platform-screen" className="min-h-screen relative overflow-hidden">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.07] pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1775057154553-0f3e8902fea3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwyfHxkYXJrJTIwYWJzdHJhY3QlMjBkaWdpdGFsJTIwbmV0d29ya3xlbnwwfHx8fDE3NzU5NTk3NTN8MA&ixlib=rb-4.1.0&q=85')",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-8 h-8 text-[#00E5FF] glow-cyan" strokeWidth={2.5} />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#8B949E] font-['Azeret_Mono']">
              Safety Training System
            </span>
          </div>
          <h1
            data-testid="hero-title"
            className="font-['Azeret_Mono'] text-4xl sm:text-5xl lg:text-[72px] font-black tracking-tighter uppercase leading-[0.95] mb-6"
          >
            Chat Safety
            <br />
            <span className="text-[#00E5FF]">Trainer</span>
          </h1>
          <p className="text-[#8B949E] text-lg max-w-lg leading-relaxed">
            Practice safe chatting with AI simulation. Get real-time safety analysis and better response suggestions.
          </p>
        </div>

        {/* Platform Grid - Bento layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Social Media Card */}
          <button
            data-testid="platform-social-media"
            onClick={() => !loading && onSelect("social_media")}
            disabled={loading}
            className="col-span-1 md:col-span-8 bg-[#101218] border border-[#222631] p-8 lg:p-12 text-left group hover:border-[#00E5FF] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 bg-[#00E5FF]/10 flex items-center justify-center group-hover:bg-[#00E5FF]/20 transition-colors">
                <MessageCircle className="w-7 h-7 text-[#00E5FF]" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#5B6471] font-['Azeret_Mono']">
                Scenario 01
              </span>
            </div>
            <h2 className="font-['Azeret_Mono'] text-2xl lg:text-3xl font-bold tracking-tight mb-3 group-hover:text-[#00E5FF] transition-colors">
              Social Media
            </h2>
            <p className="text-[#8B949E] text-sm lg:text-base leading-relaxed max-w-md">
              Practice chatting with strangers online. Learn to identify privacy risks and manipulation tactics.
            </p>
            <div className="mt-8 flex items-center gap-2 text-[#5B6471] group-hover:text-[#00E5FF] transition-colors text-xs font-bold tracking-[0.2em] uppercase font-['Azeret_Mono']">
              <span>Start Training</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </button>

          {/* Gaming Card */}
          <button
            data-testid="platform-gaming"
            onClick={() => !loading && onSelect("gaming")}
            disabled={loading}
            className="col-span-1 md:col-span-4 bg-[#101218] border border-[#222631] p-8 lg:p-12 text-left group hover:border-[#FF2A55] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 bg-[#FF2A55]/10 flex items-center justify-center group-hover:bg-[#FF2A55]/20 transition-colors">
                <Gamepad2 className="w-7 h-7 text-[#FF2A55]" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#5B6471] font-['Azeret_Mono']">
                Scenario 02
              </span>
            </div>
            <h2 className="font-['Azeret_Mono'] text-2xl font-bold tracking-tight mb-3 group-hover:text-[#FF2A55] transition-colors">
              Gaming Platform
            </h2>
            <p className="text-[#8B949E] text-sm leading-relaxed">
              Practice gaming chat conversations. Recognize toxic behavior and unsafe requests.
            </p>
            <div className="mt-8 flex items-center gap-2 text-[#5B6471] group-hover:text-[#FF2A55] transition-colors text-xs font-bold tracking-[0.2em] uppercase font-['Azeret_Mono']">
              <span>Start Training</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
