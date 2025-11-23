// src/pages/LandingPage.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import FloatingClouds from "../components/FloatingClouds";
import PatternsSection from "../components/PatternsSection";

export default function LandingPage() {
  // Parallax for background image
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const bg = document.getElementById("bgImage");
      if (bg) {
        bg.style.transform = `translateY(${scrollTop * 0.06}px) scale(1.1)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* GLOBAL BACKGROUND LAYERS */}
      <div
        id="bgImage"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center animate-bg-drift"
        style={{
          backgroundImage: "url('/images/yoki-dream-hero.png')",
          filter: "brightness(0.5) blur(3px)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(125deg,#4a90e2_0%,#5b9bd5_25%,#00cec9_50%,#ff8fab_70%,#2d8659_100%)] bg-[length:200%_200%] opacity-70 mix-blend-screen animate-gradient-slow" />
      
      {/* Additional vibrant gradient overlay - blue/teal/green */}
      <div className="pointer-events-none fixed inset-0 -z-9 bg-[radial-gradient(circle_at_30%_20%,rgba(74,144,226,0.4),transparent_50%)] animate-pulse-soft" />
      <div className="pointer-events-none fixed inset-0 -z-9 bg-[radial-gradient(circle_at_70%_80%,rgba(0,206,201,0.3),transparent_50%)] animate-pulse-soft [animation-delay:1s]" />

      {/* FLOATING CLOUDS */}
      <FloatingClouds />

      {/* FLOATING BLOBS (GLOBAL) - blue/teal/green with pink accents */}
      <div className="pointer-events-none fixed inset-0 -z-5">
        <div className="absolute top-20 left-4 h-64 w-64 rounded-full bg-[#4a90e2]/50 blur-3xl animate-float-soft shadow-[0_0_100px_rgba(74,144,226,0.6)]" />
        <div className="absolute bottom-16 right-[-40px] h-72 w-72 rounded-full bg-[#5b9bd5]/45 blur-3xl animate-float-soft2 shadow-[0_0_120px_rgba(91,155,213,0.5)]" />
        <div className="absolute top-40 right-40 h-52 w-52 rounded-full bg-[#00cec9]/40 blur-[90px] animate-float-soft [animation-delay:4s] shadow-[0_0_80px_rgba(0,206,201,0.4)]" />
        <div className="absolute bottom-4 left-1/3 h-40 w-40 rounded-full bg-[#2d8659]/40 blur-3xl animate-float-soft2 [animation-delay:6s] shadow-[0_0_60px_rgba(45,134,89,0.5)]" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a90e2]/20 blur-[120px] animate-pulse-soft [animation-delay:2s]" />
        <div className="absolute top-1/4 right-1/4 h-48 w-48 rounded-full bg-[#ff8fab]/30 blur-3xl animate-float-soft [animation-delay:3s] shadow-[0_0_70px_rgba(255,143,171,0.4)]" />
      </div>

      {/* SPARKLES - yellow-green and pink mix */}
      {[...Array(12)].map((_, i) => {
        const isPink = i % 3 === 0;
        return (
          <svg
            key={i}
            className="pointer-events-none fixed animate-twinkle-soft -z-5"
            width={18 + (i % 3) * 4}
            height={18 + (i % 3) * 4}
            style={{
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 11) % 90}%`,
              opacity: 0.9,
              animationDelay: `${i * 0.8}s`,
              filter: isPink 
                ? 'drop-shadow(0 0 4px rgba(255,143,171,0.8))'
                : 'drop-shadow(0 0 4px rgba(184,233,148,0.8))',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isPink ? "#ff8fab" : "#b8e994"}
            strokeWidth="1.5"
          >
            <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
          </svg>
        );
      })}

      {/* NAV (centered logo) - blue/teal */}
      <header className="relative z-10 flex items-center justify-center px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 relative">
          <div className="absolute inset-0 blur-xl bg-[#4a90e2]/30 rounded-full -z-10 animate-pulse-soft" />
          <img
            src="/images/logo.svg"
            alt="Lucid Loom logo"
            className="h-12 w-12 drop-shadow-[0_0_20px_rgba(74,144,226,0.6)]"
          />
          <span className="text-3xl font-display tracking-wide">
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Lucid</span>{" "}
            <span className="relative bg-gradient-to-r from-[#ffb3c1] via-[#ffccd5] via-[#ffe5ec] to-[#ffd4a3] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.9),0_0_20px_rgba(255,179,193,0.7)] animate-shimmer font-bold">
              Loom
            </span>
          </span>
        </div>
      </header>

      {/* CONTENT WRAPPER */}
      <main className="relative z-10 mt-8 space-y-24 md:space-y-32 pb-24">
        {/* SECTION 1 – HERO */}
        <section className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="rounded-3xl max-w-6xl w-full bg-white/25 backdrop-blur-3xl border-2 border-white/50 shadow-[0_40px_120px_rgba(74,144,226,0.6),0_0_60px_rgba(0,206,201,0.4)] animate-card-float px-10 py-12 md:px-14 md:py-16 relative overflow-hidden">
            {/* Glowing border effect - blue/teal with pink */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#4a90e2]/20 via-[#00cec9]/20 via-[#ff8fab]/15 to-[#2d8659]/20 blur-2xl -z-10 animate-pulse-soft" />
            {/* Inner glow */}
            <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#4a90e2]/50 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/20 to-transparent z-10 pointer-events-none" />
                <img
                  src="/images/yoki-dream-hero.png"
                  alt="Dream art"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Glow effect - blue/teal */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(74,144,226,0.3))] pointer-events-none" />
              </div>
              {/* text */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8),0_0_12px_rgba(255,255,255,0.4)]">Step into your </span>
                  <span className="bg-gradient-to-r from-[#ff6b9d] via-[#ffa07a] via-[#ffd93d] to-[#ff6b9d] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9),0_0_25px_rgba(255,107,157,1),0_0_40px_rgba(255,160,122,0.9)] animate-shimmer bg-[length:200%_200%] brightness-125">
                    dream
                  </span>{" "}
                  <span className="bg-gradient-to-r from-[#ffa07a] via-[#ffd93d] via-[#ff6b9d] to-[#ffa07a] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9),0_0_25px_rgba(255,160,122,1),0_0_40px_rgba(255,217,61,0.9)] animate-shimmer bg-[length:200%_200%] brightness-125">
                    journey.
                  </span>
                </h1>
                <p className="text-white max-w-md text-base md:text-lg leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9),0_0_4px_rgba(0,0,0,0.6)] font-medium">
                  Lucid Loom turns your raw dream notes into poetic stories,
                  symbols, and patterns you can explore over time.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] via-[#00cec9] via-[#ff8fab] to-[#2d8659] text-white font-bold text-lg shadow-[0_10px_40px_rgba(74,144,226,0.6),0_0_20px_rgba(255,143,171,0.4)] hover:brightness-110 flex items-center gap-2 transition-all hover:scale-110 hover:shadow-[0_15px_50px_rgba(74,144,226,0.8),0_0_30px_rgba(255,143,171,0.6)] relative overflow-hidden group"
                  >
                    <span className="relative z-10">Start journaling</span>
                    <span className="text-xl relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm text-white/95 hover:text-blue-200 transition drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] font-medium"
                  >
                    I already have an account
                  </Link>
                </div>
                <p className="text-sm text-white/90 italic drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                  Watch your dream world shift, one night at a time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 – PATTERNS */}
        <PatternsSection />

        {/* SECTION 3 – TIMELINE PREVIEW */}
        <section className="relative py-24 px-6 overflow-hidden flex justify-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-10 h-60 w-60 rounded-full bg-[#4a90e2]/30 blur-3xl animate-float-soft2 shadow-[0_0_70px_rgba(74,144,226,0.4)]" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#00cec9]/30 blur-3xl animate-float-soft shadow-[0_0_80px_rgba(0,206,201,0.4)]" />
          </div>

          <div className="relative max-w-6xl w-full grid gap-10 md:grid-cols-[1.1fr,1.1fr] items-center">
            {/* left text */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-semibold">
                <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">See your month of dreams</span>
                <span className="block bg-gradient-to-r from-[#4a90e2] via-[#00cec9] via-[#ff8fab] to-[#2d8659] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  as one flowing story.
                </span>
              </h2>
              <p className="text-sm md:text-base text-white/95 max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-medium">
                Lucid Loom stacks each night into a visual timeline, so you can
                spot emotional turning points, recurring themes, and quiet weeks
                where your mind finally rests.
              </p>

              <div className="space-y-3 text-sm text-slate-200/90">
                <StepBadge number={1} color="bg-[#4a90e2]">
                  <strong>Log your dreams</strong> — short notes are enough.
                  Just capture how it felt.
                </StepBadge>
                <StepBadge number={2} color="bg-[#00cec9]">
                  <strong>Let Lucid Loom interpret</strong> — we map symbols, mood, and
                  intensity for each entry.
                </StepBadge>
                <StepBadge number={3} color="bg-[#2d8659]">
                  <strong>Watch the arc appear</strong> — see how your inner
                  world shifts week by week.
                </StepBadge>
              </div>
            </div>

            {/* right: preview card */}
            <div className="relative">
              {/* orbiting chips */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-64 w-64 animate-orbit-slow">
                  <OrbitChip className="absolute -top-3 left-1/2 -translate-x-1/2">
                    vivid nights
                  </OrbitChip>
                  <OrbitChip className="absolute left-0 top-1/2 -translate-y-1/2">
                    calm
                  </OrbitChip>
                  <OrbitChip className="absolute right-0 top-1/2 -translate-y-1/2">
                    intense
                  </OrbitChip>
                  <OrbitChip className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    recurring symbols
                  </OrbitChip>
                </div>
              </div>

              <div className="relative rounded-3xl bg-white/15 backdrop-blur-2xl border border-white/30 shadow-[0_24px_80px_rgba(74,144,226,0.4)] px-6 py-5 md:px-7 md:py-6">
                <div className="flex items-center justify-between mb-3 text-xs text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                  <p className="uppercase tracking-wide font-medium">
                    Dream timeline preview
                  </p>
                  <p className="font-medium">Last 30 nights</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/90 p-4 md:p-5">
                  <div className="flex justify-between items-center mb-4 text-[11px] text-slate-400">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>

                  <div className="relative h-16 md:h-20 flex items-center">
                    <div className="absolute left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#4a90e2]/40 via-[#00cec9]/50 via-[#ff8fab]/45 to-[#2d8659]/50" />
                    <div className="absolute left-0 top-1/2 h-8 w-24 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,#4a90e2,transparent)] animate-timeline-glow" />

                    <div className="relative flex w-full justify-between">
                      {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                        <div
                          key={idx}
                          className="relative flex flex-col items-center"
                        >
                          <div
                            className="h-4 w-4 rounded-full border border-[#4a90e2]/70 bg-slate-900 shadow-[0_0_12px_rgba(74,144,226,0.7)]"
                            style={{
                              opacity: idx === 2 || idx === 5 ? 1 : 0.6,
                              background:
                                idx === 2 || idx === 5
                                  ? "radial-gradient(circle at center,#4a90e2,#00cec9)"
                                  : "radial-gradient(circle at center,#00cec9,#1b2338)",
                            }}
                          />
                          <span className="mt-1 text-[9px] text-slate-400">
                            {idx === 2 || idx === 5 ? "vivid" : "light"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-slate-300/85">
                    <LegendDot color="bg-[#4a90e2]">
                      strong emotional nights
                    </LegendDot>
                    <LegendDot color="bg-[#00cec9]">
                      light recall
                    </LegendDot>
                    <LegendBar>
                      overall emotional arc
                    </LegendBar>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                  In the live app, this timeline will be generated from your
                  actual dream entries – this preview just shows the feeling.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Small helper components */

function StepBadge({ number, color, children }) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-1 h-5 w-5 rounded-full ${color} flex items-center justify-center text-[10px] text-slate-900 font-bold`}
      >
        {number}
      </span>
      <p>{children}</p>
    </div>
  );
}

function OrbitChip({ children, className = "" }) {
  return (
    <span
      className={
        "text-[11px] px-2 py-1 rounded-full bg-white/15 border border-white/30 " +
        className
      }
    >
      {children}
    </span>
  );
}

function LegendDot({ color, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{children}</span>
    </div>
  );
}

function LegendBar({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-[#4a90e2] via-[#00cec9] via-[#ff8fab] to-[#2d8659]" />
      <span>{children}</span>
    </div>
  );
}

