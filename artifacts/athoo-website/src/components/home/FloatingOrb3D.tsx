import { useEffect, useRef, useState } from "react";
import { MapPin, Wifi, ShieldCheck, Zap } from "lucide-react";

const NODES = [
  { label: "Rawalpindi", color: "#0057FF", angle: 30, ring: 1 },
  { label: "Islamabad", color: "#FF8A00", angle: 200, ring: 2 },
  { label: "Verified", color: "#22c55e", angle: 310, ring: 3 },
  { label: "10+ Services", color: "#a855f7", angle: 150, ring: 1 },
];

const STATS = [
  { icon: Zap, label: "Fast Booking", value: "< 60s", color: "#0057FF" },
  { icon: ShieldCheck, label: "Verified Only", value: "100%", color: "#22c55e" },
  { icon: MapPin, label: "Cities", value: "RWP + ISB", color: "#FF8A00" },
  { icon: Wifi, label: "Real-Time", value: "Updates", color: "#a855f7" },
];

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const IconComp = stat.icon;
  return (
    <div
      data-orb-card
      className="athoo-reveal-scale group relative overflow-hidden rounded-3xl p-6 transition-all duration-500"
      style={{
        background: "rgba(8,17,32,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        transitionDelay: `${index * 100}ms`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 0 40px ${stat.color}30`;
        el.style.borderColor = `${stat.color}40`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "none";
        el.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}
      >
        <IconComp className="h-6 w-6" style={{ color: stat.color }} />
      </div>
      <div
        className="mb-1 text-2xl font-black"
        style={{
          background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {stat.value}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }}
      />
    </div>
  );
}

export default function FloatingOrb3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-orb-card]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#040c1c] py-20 sm:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,87,255,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="athoo-reveal mb-14 text-center">
          <span className="inline-block rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-black text-purple-400">
            Pakistan Service Network
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Connecting Pakistan{" "}
            <span className="bg-gradient-to-r from-[#0057FF] to-[#FF8A00] bg-clip-text text-transparent">
              City by City
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            One platform. Verified professionals. Launching soon across Pakistan.
          </p>
        </div>

        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
          {/* Animated service network orb */}
          <div className="relative flex w-full justify-center lg:flex-1">
              <div
                className="relative flex items-center justify-center"
                style={{ width: 320, height: 320, perspective: "900px" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Outer glow */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 340, height: 340,
                      background: "radial-gradient(circle, rgba(0,87,255,0.15), transparent 65%)",
                      animation: "athoo-pulse 3.5s ease-in-out infinite",
                    }}
                  />

                  {/* Core sphere */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 200, height: 200,
                      background:
                        "radial-gradient(circle at 38% 32%, rgba(120,170,255,0.95), rgba(0,87,255,0.85) 45%, rgba(0,30,140,0.88) 72%, #040c1c)",
                      boxShadow:
                        "0 0 60px rgba(0,87,255,0.55), 0 0 120px rgba(0,87,255,0.18), inset -16px -16px 36px rgba(0,0,0,0.35), inset 10px 10px 28px rgba(255,255,255,0.07)",
                      animation: "float 8s ease-in-out infinite",
                    }}
                  >
                    {/* Grid overlay */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: 0,
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                        WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                        borderRadius: "50%",
                      }}
                    />
                    {/* Highlight */}
                    <div
                      className="absolute"
                      style={{
                        top: "12%", left: "18%", width: "36%", height: "28%",
                        background: "radial-gradient(ellipse, rgba(255,255,255,0.28), transparent 70%)",
                        borderRadius: "50%",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-white/90" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
                        PK
                      </span>
                    </div>
                  </div>

                  {/* Orbit ring 1 */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 280, height: 280,
                      border: "1.5px solid rgba(0,87,255,0.45)",
                      animation: "orbit-a 7s linear infinite",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div style={{ position: "absolute", top: "50%", left: 0, width: 12, height: 12, borderRadius: "50%", background: "#0057FF", boxShadow: "0 0 12px #0057FF, 0 0 24px rgba(0,87,255,0.5)", transform: "translate(-50%, -50%)" }} />
                    <div style={{ position: "absolute", top: "50%", right: 0, width: 8, height: 8, borderRadius: "50%", background: "rgba(0,87,255,0.5)", transform: "translate(50%, -50%)" }} />
                  </div>

                  {/* Orbit ring 2 */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 320, height: 320,
                      border: "1.5px solid rgba(255,138,0,0.35)",
                      animation: "orbit-b 11s linear infinite reverse",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: "50%", width: 11, height: 11, borderRadius: "50%", background: "#FF8A00", boxShadow: "0 0 12px #FF8A00, 0 0 24px rgba(255,138,0,0.5)", transform: "translate(-50%, -50%)" }} />
                  </div>

                  {/* Orbit ring 3 */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 240, height: 240,
                      border: "1px solid rgba(34,197,94,0.3)",
                      animation: "orbit-c 9s linear infinite",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div style={{ position: "absolute", bottom: 0, left: "50%", width: 9, height: 9, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e", transform: "translate(-50%, 50%)" }} />
                  </div>
                </div>

                {/* Floating labels */}
                {NODES.map((node) => {
                  const rad = (node.angle * Math.PI) / 180;
                  const r = node.ring === 1 ? 140 : node.ring === 2 ? 160 : 120;
                  const x = Math.cos(rad) * r;
                  const y = Math.sin(rad) * r * 0.35;
                  return (
                    <div
                      key={node.label}
                      className="pointer-events-none absolute"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                    >
                      <div
                        className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-black"
                        style={{
                          background: `${node.color}22`,
                          border: `1px solid ${node.color}50`,
                          color: node.color,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {node.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          {/* Stats cards */}
          <div className={isMobile ? "w-full" : "w-full lg:flex-1"}>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
            </div>

            <div
              className="athoo-reveal mt-4 rounded-3xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(0,87,255,0.1), rgba(255,138,0,0.05))",
                border: "1px solid rgba(0,87,255,0.2)",
                transitionDelay: "400ms",
              }}
            >
              <p className="text-sm font-bold leading-6 text-slate-300">
                Athoo is building Pakistan's most trusted home services network — starting in Rawalpindi & Islamabad, with nationwide expansion planned.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
