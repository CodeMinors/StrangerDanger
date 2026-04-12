import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

function ScoreBar({ score }) {
  const color = score >= 70 ? "#00FF66" : score >= 40 ? "#FFB000" : "#FF2A55";
  return (
    <div className="mb-6">
      <div className="flex items-end gap-3 mb-3">
        <span className="font-['Azeret_Mono'] text-5xl font-black" style={{ color }}>{score}</span>
        <span className="text-xl text-[#5B6471] font-['Azeret_Mono'] mb-1">/100</span>
      </div>
      <div className="w-full h-1.5 bg-[#222631]">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AnalysisPanel({ analysis, showAnalysis, onToggle }) {
  return (
    <div data-testid="analysis-panel" className="w-full lg:w-[440px] bg-[#06070A] border-l border-[#222631] overflow-y-auto shrink-0 hidden lg:block">
      {!showAnalysis ? (
        <div className="flex items-center justify-center h-full">
          <button
            data-testid="show-analysis-btn"
            onClick={onToggle}
            className="bg-[#00E5FF] text-black font-bold uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors flex items-center gap-3 text-sm font-['Azeret_Mono']"
          >
            <ShieldCheck className="w-5 h-5" />
            Show Safety Analysis
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-5 animate-slide-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B949E] font-['Azeret_Mono']">
              Safety Analysis
            </span>
            <button
              data-testid="hide-analysis-btn"
              onClick={onToggle}
              className="text-[#5B6471] hover:text-white text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Hide
            </button>
          </div>

          {!analysis ? (
            <div className="text-center py-12">
              <ShieldAlert className="w-10 h-10 text-[#5B6471] mx-auto mb-3" />
              <p className="text-[#5B6471] text-sm">Send a message to see safety analysis</p>
            </div>
          ) : (
            <>
              {/* Score */}
              <div className="bg-[#101218] border border-[#222631] p-5">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B949E] mb-4 font-['Azeret_Mono']">
                  Safety Score
                </p>
                <ScoreBar score={analysis.score} />
              </div>

              {/* Red Flags */}
              {analysis.red_flags && analysis.red_flags.length > 0 && (
                <div data-testid="red-flags" className="bg-[#101218] border border-[#FF2A55]/30 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF2A55] glow-red" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#FF2A55] font-['Azeret_Mono']">
                      Danger Signs
                    </span>
                  </div>
                  {analysis.red_flags.map((flag, i) => (
                    <div key={i} className="border-l-2 border-[#FF2A55]/40 pl-3">
                      <p className="text-sm font-semibold text-white mb-0.5">{flag.title}</p>
                      <p className="text-xs text-[#8B949E] leading-relaxed">{flag.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Green Flags */}
              {analysis.green_flags && analysis.green_flags.length > 0 && (
                <div data-testid="green-flags" className="bg-[#101218] border border-[#00FF66]/30 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00FF66] glow-green" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00FF66] font-['Azeret_Mono']">
                      Safe Aspects
                    </span>
                  </div>
                  {analysis.green_flags.map((flag, i) => (
                    <div key={i} className="border-l-2 border-[#00FF66]/40 pl-3">
                      <p className="text-sm font-semibold text-white mb-0.5">{flag.title}</p>
                      <p className="text-xs text-[#8B949E] leading-relaxed">{flag.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {analysis.alternative_suggestions && analysis.alternative_suggestions.length > 0 && (
                <div data-testid="suggestions" className="bg-[#101218] border border-[#222631] p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[#00E5FF]" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B949E] font-['Azeret_Mono']">
                      Better Responses
                    </span>
                  </div>
                  {analysis.alternative_suggestions.map((s, i) => (
                    <div key={i} className="bg-[#181A22] border border-[#222631] px-3 py-2.5 text-xs text-[#8B949E] leading-relaxed">
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
