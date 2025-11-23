// PatternsSection.jsx
import { useState, useEffect } from "react";

export default function PatternsSection() {
  const [stats, setStats] = useState({
    symbols: 0,
    dreams: 0,
    patterns: 0,
  });

  useEffect(() => {
    // Random stats that animate
    const interval = setInterval(() => {
      setStats({
        symbols: Math.floor(Math.random() * 50) + 20,
        dreams: Math.floor(Math.random() * 200) + 100,
        patterns: Math.floor(Math.random() * 15) + 5,
      });
    }, 3000);

    // Initial values
    setStats({
      symbols: Math.floor(Math.random() * 50) + 20,
      dreams: Math.floor(Math.random() * 200) + 100,
      patterns: Math.floor(Math.random() * 15) + 5,
    });

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative px-6 py-24 flex justify-center overflow-hidden">
      {/* soft background blobs just for this section */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#ff8fab]/28 blur-3xl" />
        <div className="absolute right-[-60px] bottom-0 h-80 w-80 rounded-full bg-[#ffb3c1]/30 blur-3xl" />
        <div className="absolute left-1/2 top-full h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffccd5]/35 blur-[90px]" />
      </div>

      {/* floating sparkles under heading */}
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          className="pointer-events-none absolute animate-sparkle-float"
          style={{
            top: `${26 + i * 3}%`,
            left: `${45 + i * 6}%`,
            animationDelay: `${i * 0.7}s`,
          }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1"
        >
          <path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
        </svg>
      ))}

      <div className="relative max-w-6xl w-full animate-section-fade-up">
        {/* heading + subtitle + stats */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
            <span className="bg-gradient-to-r from-[#ff8fab] via-[#ffb3c1] to-[#ffccd5] bg-clip-text text-transparent">
              Discover the patterns
            </span>{" "}
            in your dreams
          </h2>
          <p className="mt-4 text-sm md:text-base text-slate-100/90">
            Every dream reveals a deeper story. Explore recurring themes,
            emotional currents, and symbolic clues from your subconscious.
          </p>
          
          {/* Random animated stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#ff8fab] to-[#ffb3c1] bg-clip-text text-transparent animate-pulse-soft">
                {stats.symbols}+
              </div>
              <div className="text-xs text-slate-300/80 mt-1">Symbols</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#ffb3c1] to-[#ffccd5] bg-clip-text text-transparent animate-pulse-soft [animation-delay:0.2s]">
                {stats.dreams}+
              </div>
              <div className="text-xs text-slate-300/80 mt-1">Dreams</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#ffccd5] to-[#a5b4fc] bg-clip-text text-transparent animate-pulse-soft [animation-delay:0.4s]">
                {stats.patterns}+
              </div>
              <div className="text-xs text-slate-300/80 mt-1">Patterns</div>
            </div>
          </div>
        </div>

        {/* cards row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* CARD 1 – recurring symbols */}
          <div className="group relative">
            {/* glowing frame */}
            <div className="absolute -inset-[1px] rounded-[26px] bg-[linear-gradient(120deg,rgba(255,143,171,0.8),rgba(255,225,235,0.3),rgba(148,163,255,0.7))] opacity-60 blur-[1px]" />
            <div className="relative rounded-[24px] bg-slate-900/60 backdrop-blur-xl border border-white/20 p-6 shadow-xl shadow-[#020617]/80 animate-card-entrance group-hover:-translate-y-2 group-hover:shadow-[#ff8fab]/40 group-hover:scale-[1.02] transition-all duration-500 h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200/80 mb-3">
                <span className="text-2xl animate-symbol-float">🌙</span>
                <span className="uppercase">Recurring symbols</span>
              </div>
              <h3 className="font-semibold mb-2 text-white group-hover:text-[#ff8fab] transition-colors duration-300">See what keeps returning.</h3>
              <p className="text-sm text-slate-200/85 mb-4 flex-grow">
                Lucid Loom highlights repeating places, emotions, and characters
                across nights, so you can see what your mind keeps circling.
              </p>

              {/* Creative symbol illustrations */}
              <div className="mb-4 flex items-center justify-center gap-6">
                {/* Moon illustration */}
                <div className="flex flex-col items-center gap-2 animate-symbol-float">
                  <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/40 via-yellow-100/30 to-transparent blur-sm animate-pulse-soft" />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-300/50 to-slate-400/30" />
                    <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-slate-600/40 animate-pulse-soft" />
                    <div className="absolute top-5 right-3 w-2 h-2 rounded-full bg-slate-500/30 animate-pulse-soft [animation-delay:0.3s]" />
                  </div>
                  <span className="text-[10px] text-slate-300/70">Moon</span>
                </div>
                
                {/* Water wave illustration */}
                <div className="flex flex-col items-center gap-2 animate-symbol-float [animation-delay:0.2s]">
                  <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      <path
                        d="M0 32 Q 16 20, 32 32 T 64 32"
                        fill="none"
                        stroke="url(#waveGrad1)"
                        strokeWidth="3"
                        className="animate-gradient-wave"
                      />
                      <path
                        d="M0 40 Q 16 28, 32 40 T 64 40"
                        fill="none"
                        stroke="url(#waveGrad2)"
                        strokeWidth="3"
                        className="animate-gradient-wave"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <defs>
                        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                        </linearGradient>
                        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-300/70">Water</span>
                </div>
                
                {/* Tree illustration */}
                <div className="flex flex-col items-center gap-2 animate-symbol-float [animation-delay:0.4s]">
                  <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-8 bg-gradient-to-t from-amber-700/50 to-amber-600/40 rounded-sm" />
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-green-400/50 via-green-500/40 to-emerald-600/30 blur-sm animate-pulse-soft" />
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-green-300/60 to-green-400/40" />
                  </div>
                  <span className="text-[10px] text-slate-300/70">Tree</span>
                </div>
              </div>

              {/* animated gradient bar */}
              <div className="mt-auto h-3 w-full rounded-full bg-slate-900/80 overflow-hidden relative group-hover:h-3.5 transition-all duration-300">
                <div className="h-full w-full bg-[linear-gradient(90deg,#ff8fab,#ffb3c1,#ffccd5,#a5b4fc,#22c55e,#ff8fab)] bg-[length:200%_100%] animate-gradient-wave" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-shimmer" />
              </div>
            </div>
          </div>

          {/* CARD 2 – emotional waves */}
          <div className="group relative">
            <div className="absolute -inset-[1px] rounded-[26px] bg-[linear-gradient(120deg,rgba(244,114,182,0.9),rgba(255,243,244,0.3),rgba(129,140,248,0.8))] opacity-60 blur-[1px]" />
            <div className="relative rounded-[24px] bg-slate-900/60 backdrop-blur-xl border border-white/20 p-6 shadow-xl shadow-[#020617]/80 animate-card-entrance group-hover:-translate-y-2 group-hover:shadow-pink-400/40 group-hover:scale-[1.02] transition-all duration-500 [animation-delay:0.15s] h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200/80 mb-3">
                <span className="text-2xl animate-symbol-float [animation-delay:0.1s]">💗</span>
                <span className="uppercase">Emotional waves</span>
              </div>
              <h3 className="font-semibold mb-2 text-white group-hover:text-pink-300 transition-colors duration-300">Track your nights.</h3>
              <p className="text-sm text-slate-200/85 mb-4 flex-grow">
                Watch how calm, tension, or curiosity rise and fall over time as
                Lucid Loom maps the emotional tone of each dream.
              </p>

              {/* Creative emotion visualizations */}
              <div className="mb-4 flex items-center justify-center gap-6">
                {/* Calm - gentle waves */}
                <div className="flex flex-col items-center gap-2 animate-symbol-float">
                  <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 via-cyan-300/20 to-transparent animate-pulse-soft" />
                    <svg viewBox="0 0 64 64" className="w-full h-full absolute inset-0">
                      <path
                        d="M8 32 Q 20 28, 32 32 T 56 32"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-gradient-wave"
                      />
                      <path
                        d="M8 40 Q 20 36, 32 40 T 56 40"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        opacity="0.4"
                        className="animate-gradient-wave"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-300/70">Calm</span>
                </div>
                
                {/* Love - heart shape */}
                <div className="flex flex-col items-center gap-2 animate-symbol-float [animation-delay:0.2s]">
                  <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      <path
                        d="M32 48 C 20 36, 12 28, 12 20 C 12 14, 16 10, 22 10 C 26 10, 30 12, 32 16 C 34 12, 38 10, 42 10 C 48 10, 52 14, 52 20 C 52 28, 44 36, 32 48 Z"
                        fill="url(#heartGrad)"
                        className="animate-pulse-soft"
                      />
                      <defs>
                        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-300/70">Love</span>
                </div>
                
                {/* Curious - question mark with sparkle */}
                <div className="flex flex-col items-center gap-2 animate-symbol-float [animation-delay:0.4s]">
                  <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/30 via-amber-300/20 to-orange-400/30 animate-pulse-soft" />
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-yellow-300/60" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-yellow-300/60 rounded-full" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-yellow-300/60" />
                    <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-yellow-200/80 animate-twinkle-soft" />
                  </div>
                  <span className="text-[10px] text-slate-300/70">Curious</span>
                </div>
              </div>

              {/* drifting pills with enhanced animation */}
              <div className="mt-auto flex items-end gap-2 h-14 group-hover:gap-3 transition-all duration-300">
                {[
                  { color: "#22c55e", height: 45 },
                  { color: "#fbbf24", height: 70 },
                  { color: "#fb7185", height: 55 },
                  { color: "#a855f7", height: 85 },
                ].map((item, idx) => (
                  <div
                    key={item.color}
                    className="flex-1 rounded-full animate-pill-drift relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, rgba(255,255,255,0.85))`,
                      height: `${item.height}%`,
                      animationDelay: `${idx * 0.2}s`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.5),transparent)] animate-shimmer" style={{ animationDelay: `${idx * 0.3}s` }} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(255,255,255,0.2))] animate-pulse-soft" style={{ animationDelay: `${idx * 0.4}s` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 3 – dream timeline */}
          <div className="group relative">
            <div className="absolute -inset-[1px] rounded-[26px] bg-[linear-gradient(120deg,rgba(129,140,248,0.85),rgba(224,231,255,0.3),rgba(96,165,250,0.8))] opacity-60 blur-[1px]" />
            <div className="relative rounded-[24px] bg-slate-900/60 backdrop-blur-xl border border-white/20 p-6 shadow-xl shadow-[#020617]/80 animate-card-entrance group-hover:-translate-y-2 group-hover:shadow-indigo-400/40 group-hover:scale-[1.02] transition-all duration-500 [animation-delay:0.3s] h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200/80 mb-3">
                <span className="text-2xl animate-symbol-float [animation-delay:0.2s]">🌀</span>
                <span className="uppercase">Dream timeline</span>
              </div>
              <h3 className="font-semibold mb-2 text-white group-hover:text-indigo-300 transition-colors duration-300">
                Watch your inner world shift.
              </h3>
              <p className="text-sm text-slate-200/85 mb-4 flex-grow">
                Zoom out to see your month of dreams as a flowing emotional arc,
                with vivid spikes and quiet stretches highlighted.
              </p>

              {/* Timeline Preview Visualization */}
              <div className="mt-auto rounded-xl bg-slate-800/60 border border-white/10 p-4 group-hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                {/* floating mini clouds behind the chart */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                  {/* cloud 1 */}
                  <div className="absolute top-4 left-4 w-24 h-10 rounded-full bg-white/40 blur-3xl animate-tiny-cloud">
                    <div className="absolute -top-3 left-4 w-10 h-7 rounded-full bg-white/45 blur-3xl" />
                    <div className="absolute -top-2 right-3 w-9 h-6 rounded-full bg-white/45 blur-3xl" />
                  </div>
                  {/* cloud 2 */}
                  <div className="absolute bottom-6 right-6 w-20 h-8 rounded-full bg-white/35 blur-3xl animate-tiny-cloud [animation-delay:6s]">
                    <div className="absolute -top-2 left-3 w-9 h-6 rounded-full bg-white/40 blur-3xl" />
                  </div>
                  {/* cloud 3 - additional for more presence */}
                  <div className="absolute top-1/2 left-1/3 w-16 h-6 rounded-full bg-white/30 blur-3xl animate-tiny-cloud [animation-delay:3s]">
                    <div className="absolute -top-1.5 right-2 w-7 h-5 rounded-full bg-white/35 blur-3xl" />
                  </div>
                  {/* cloud 4 - subtle accent */}
                  <div className="absolute top-8 right-1/4 w-14 h-5 rounded-full bg-blue-200/20 blur-3xl animate-tiny-cloud [animation-delay:9s]">
                    <div className="absolute -top-1 left-2 w-6 h-4 rounded-full bg-blue-200/25 blur-3xl" />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3 relative z-20">
                  <span className="text-xs font-semibold text-white/90">DREAM TIMELINE PREVIEW</span>
                  <span className="text-[10px] text-slate-300/70">Last 30 nights</span>
                </div>
                
                {/* Week labels */}
                <div className="flex justify-between mb-2 text-[10px] text-slate-400/80 relative z-20">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>

                {/* Timeline with nodes */}
                <div className="relative h-16 mb-3 z-20">
                  {/* Overall emotional arc bar */}
                  <div className="absolute top-0 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-[#ff8fab] via-[#ffb3c1] via-[#a5b4fc] to-[#22c55e] opacity-60 animate-gradient-wave" />
                  
                  {/* Timeline line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700/50 -translate-y-1/2" />
                  
                  {/* Nodes */}
                  <div className="relative flex w-full justify-between items-center h-full">
                    {/* Week 1 - 2 nodes (light) */}
                    <div className="absolute left-[8%] flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-[#00cec9]/80 border border-[#00cec9]/50 shadow-[0_0_8px_rgba(0,206,201,0.5)] animate-node-pulse" />
                      <div className="h-3 w-3 rounded-full bg-[#00cec9]/80 border border-[#00cec9]/50 shadow-[0_0_8px_rgba(0,206,201,0.5)] animate-node-pulse [animation-delay:0.3s]" />
                    </div>
                    {/* Week 2 - 1 node (vivid) */}
                    <div className="absolute left-[35%]">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#4a90e2] border border-[#4a90e2]/70 shadow-[0_0_10px_rgba(74,144,226,0.7)] animate-timeline-glow" />
                    </div>
                    {/* Week 3 - 2 nodes (light) */}
                    <div className="absolute left-[62%] flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-[#00cec9]/80 border border-[#00cec9]/50 shadow-[0_0_8px_rgba(0,206,201,0.5)] animate-node-pulse [animation-delay:0.6s]" />
                      <div className="h-3 w-3 rounded-full bg-[#00cec9]/80 border border-[#00cec9]/50 shadow-[0_0_8px_rgba(0,206,201,0.5)] animate-node-pulse [animation-delay:0.9s]" />
                    </div>
                    {/* Week 4 - 2 nodes (vivid + light) */}
                    <div className="absolute left-[88%] flex items-center gap-3">
                      <div className="h-3.5 w-3.5 rounded-full bg-[#4a90e2] border border-[#4a90e2]/70 shadow-[0_0_10px_rgba(74,144,226,0.7)] animate-timeline-glow [animation-delay:0.4s]" />
                      <div className="h-3 w-3 rounded-full bg-[#00cec9]/80 border border-[#00cec9]/50 shadow-[0_0_8px_rgba(0,206,201,0.5)] animate-node-pulse [animation-delay:1.2s]" />
                    </div>
                  </div>
                  
                  {/* Labels under nodes */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[9px] text-slate-400/70">
                    <div className="flex gap-6">
                      <span>light</span>
                      <span>light</span>
                    </div>
                    <span>vivid</span>
                    <div className="flex gap-6">
                      <span>light</span>
                      <span>light</span>
                    </div>
                    <div className="flex gap-6">
                      <span>vivid</span>
                      <span>light</span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-[10px] text-slate-300/80 mt-6 relative z-20">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#4a90e2] shadow-[0_0_6px_rgba(74,144,226,0.6)] animate-pulse-soft" />
                    <span>strong emotional nights</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#00cec9] shadow-[0_0_6px_rgba(0,206,201,0.5)] animate-pulse-soft [animation-delay:0.2s]" />
                    <span>light recall</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-5 rounded-full bg-gradient-to-r from-[#ff8fab] via-[#a5b4fc] to-[#22c55e] animate-gradient-wave" />
                    <span>overall emotional arc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
