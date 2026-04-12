import { ShieldCheck, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

function AnimatedScore({ target }) {
  const [count, setCount] = useState(0);
  const color = target >= 70 ? "#00FF66" : target >= 40 ? "#FFB000" : "#FF2A55";

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div className="flex items-end justify-center gap-3 mb-4">
      <span className="font-['Azeret_Mono'] text-7xl font-black" style={{ color }}>
        {count}
      </span>
      <span className="text-2xl text-[#5B6471] font-['Azeret_Mono'] mb-2">/100</span>
    </div>
  );
}

export default function ResultScreen({ data, onRestart }) {
  if (!data) return null;

  const scoreColor = data.final_score >= 70 ? "#00FF66" : data.final_score >= 40 ? "#FFB000" : "#FF2A55";

  return (
    <div data-testid="result-screen" className="min-h-screen flex items-center justify-center p-6 bg-[#06070A]">
      <div className="bg-[#101218] border border-[#222631] p-8 lg:p-12 max-w-[720px] w-full animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#8B949E] font-['Azeret_Mono']">
              Session Complete
            </span>
          </div>
          <h2 data-testid="result-title" className="font-['Azeret_Mono'] text-3xl lg:text-4xl font-black tracking-tighter uppercase mb-8">
            Chat Session
            <br />
            <span className="text-[#00E5FF]">Complete</span>
          </h2>

          {/* Score */}
          <div className="mb-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#5B6471] mb-4 font-['Azeret_Mono']">
              Overall Safety Score
            </p>
            <AnimatedScore target={data.final_score} />
            <div className="w-full h-1.5 bg-[#222631] max-w-sm mx-auto">
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{ width: `${data.final_score}%`, background: scoreColor }}
              />
            </div>
          </div>
        </div>

        {/* Decision Feedback */}
        <div
          data-testid="feedback-box"
          className={`p-6 mb-6 border ${
            data.was_correct_action
              ? "bg-[rgba(0,255,102,0.05)] border-[#00FF66]/30"
              : "bg-[rgba(255,176,0,0.05)] border-[#FFB000]/30"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {data.was_correct_action ? (
              <CheckCircle className="w-5 h-5 text-[#00FF66] glow-green shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#FFB000] shrink-0" />
            )}
            <h3 data-testid="feedback-title" className="font-['Azeret_Mono'] text-base font-bold tracking-tight">
              {data.decision_feedback}
            </h3>
          </div>
          <p data-testid="feedback-explanation" className="text-sm text-[#8B949E] leading-relaxed">
            {data.explanation}
          </p>
        </div>

        {/* Score Recommendation */}
        <div className="bg-[#181A22] border border-[#222631] p-6 mb-6">
          <h4 className="font-['Azeret_Mono'] text-xs font-bold tracking-[0.2em] uppercase text-[#8B949E] mb-3">
            What This Score Means
          </h4>
          <p data-testid="score-recommendation" className="text-sm text-[#8B949E] leading-relaxed">
            {data.safety_recommendation}
          </p>
        </div>

        {/* Bot Truth */}
        <div className="border-2 border-[#FFB000] bg-[rgba(255,176,0,0.05)] p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#FFB000] shrink-0" />
            <h4 className="font-['Azeret_Mono'] text-xs font-bold tracking-[0.2em] uppercase text-[#FFB000]">
              The Truth About This User
            </h4>
          </div>
          <p data-testid="bot-truth" className="text-sm text-[#8B949E] leading-relaxed">
            {data.bot_truth}
          </p>
        </div>

        {/* Restart */}
        <div className="text-center">
          <button
            data-testid="restart-btn"
            onClick={onRestart}
            className="bg-[#00E5FF] text-black font-bold uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors flex items-center gap-3 mx-auto text-sm font-['Azeret_Mono']"
          >
            <RotateCcw className="w-4 h-4" />
            Try Another Scenario
          </button>
        </div>
      </div>
    </div>
  );
}
