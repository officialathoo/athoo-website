import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck, Star, MapPin, Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles } from "lucide-react";

const PROVIDERS = [
  { name: "Ahmed K.", role: "Master Electrician", rating: 4.9, jobs: 312, icon: Zap, color: "#0057FF" },
  { name: "Bilal S.", role: "Plumbing Expert", rating: 4.8, jobs: 246, icon: Droplets, color: "#06b6d4" },
  { name: "Usman A.", role: "AC Technician", rating: 4.9, jobs: 401, icon: Wind, color: "#10b981" },
  { name: "Imran R.", role: "Carpenter", rating: 4.7, jobs: 186, icon: Hammer, color: "#FF8A00" },
  { name: "Saad M.", role: "Painter", rating: 4.8, jobs: 214, icon: PaintRoller, color: "#a855f7" },
  { name: "Athoo Team", role: "Cleaning Pros", rating: 4.9, jobs: 355, icon: Sparkles, color: "#22c55e" },
];

const STEPS = [
  { num: "01", title: "Verified Profiles", desc: "Professionals are reviewed before joining the Athoo network." },
  { num: "02", title: "Transparent Requests", desc: "Customers share clear service details before provider matching." },
  { num: "03", title: "Local Coverage", desc: "Built first for Rawalpindi and Islamabad service needs." },
  { num: "04", title: "Better Experience", desc: "Cleaner communication, faster updates and organized leads." },
];

type Provider = (typeof PROVIDERS)[number];

function useIsCompact() {
  const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return compact;
}

function ProviderCard({ provider, active = false, compact = false }: { provider: Provider; active?: boolean; compact?: boolean }) {
  const IconComp = provider.icon;
  return (
    <div
      className="h-full rounded-3xl border p-4 shadow-2xl transition-transform duration-300 sm:p-5"
      style={{
        background: active
          ? `linear-gradient(135deg, ${provider.color}26, rgba(8,17,32,0.96))`
          : "rgba(8,17,32,0.94)",
        borderColor: active ? `${provider.color}70` : "rgba(255,255,255,0.12)",
        boxShadow: active ? `0 0 34px ${provider.color}55` : "0 12px 36px rgba(0,0,0,0.42)",
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}45`, boxShadow: `0 0 20px ${provider.color}35` }}
        >
          <IconComp className="h-6 w-6" style={{ color: provider.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-white sm:text-base">{provider.name}</h3>
          <p className="truncate text-xs font-semibold text-slate-300">{provider.role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
        <span className="flex items-center gap-1 text-xs font-black text-yellow-300"><Star className="h-3.5 w-3.5 fill-yellow-300" /> {provider.rating}</span>
        <span className="text-xs font-bold text-slate-300">{provider.jobs}+ jobs</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-black text-green-300">
        <ShieldCheck className="h-4 w-4" /> Verified Partner
      </div>
    </div>
  );
}

export default function VirtualShowroom() {
  const compact = useIsCompact();
  const [rotY, setRotY] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0, moved: false });
  const frameRef = useRef<number>(0);
  const total = PROVIDERS.length;

  useEffect(() => {
    const tick = () => {
      if (!dragRef.current.dragging && !hovered) setRotY((r) => r + (compact ? 0.24 : 0.13));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [compact, hovered]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { dragging: true, startX: e.clientX, startRot: rotY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    const delta = e.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 3) dragRef.current.moved = true;
    setRotY(dragRef.current.startRot + delta * (compact ? 0.82 : 0.34));
  };
  const finishDrag = () => {
    if (compact && dragRef.current.moved) {
      const step = 360 / total;
      setRotY((r) => Math.round(r / step) * step);
    }
    dragRef.current.dragging = false;
  };

  const radius = compact ? 118 : 310;
  const cardWidth = compact ? 168 : 220;
  const activeIndex = useMemo(() => {
    const step = 360 / total;
    return ((Math.round((-rotY % 360) / step) % total) + total) % total;
  }, [rotY, total]);

  return (
    <section className="relative overflow-hidden bg-[#020817] py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,87,255,0.16),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.045)_1px,transparent_1px)] bg-[size:52px_52px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">
            Meet Athoo Providers
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Verified Local{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-blue-300 to-[#4facfe] bg-clip-text text-transparent">
              Experts
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Trusted professionals prepared for a better home service experience.
          </p>
        </div>

        <div
          className="relative mx-auto select-none touch-pan-y"
          style={{ height: compact ? 360 : 430, perspective: compact ? 850 : 1000, cursor: dragRef.current.dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerLeave={finishDrag}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-emerald-400/20" style={{ width: compact ? 230 : 620, height: compact ? 230 : 330, transform: "translate(-50%, -50%) rotateX(64deg)", animation: "athoo-spin 19s linear infinite" }} />
          <div className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-blue-400/20" style={{ width: compact ? 285 : 690, height: compact ? 285 : 390, transform: "translate(-50%, -50%) rotateX(64deg)", animation: "athoo-spin 26s linear infinite reverse" }} />

          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {PROVIDERS.map((p, i) => {
              const angle = (i / total) * 360 + rotY;
              const rad = (angle * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const z = Math.cos(rad) * radius;
              const depth = (z + radius) / (2 * radius);
              const scale = compact ? 0.78 + depth * 0.32 : 0.66 + depth * 0.44;
              const opacity = compact ? 0.42 + depth * 0.58 : 0.55 + depth * 0.45;
              const active = compact ? i === activeIndex : depth > 0.72 || hovered === p.name;
              return (
                <div
                  key={p.name}
                  onMouseEnter={() => setHovered(p.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: cardWidth,
                    transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${compact ? z * 0.24 : z * 0.1}px) scale(${scale})`,
                    zIndex: Math.round(scale * 100 + z),
                    opacity,
                    transition: dragRef.current.dragging ? "none" : "opacity 180ms ease, transform 220ms ease",
                    pointerEvents: active ? "auto" : "none",
                  }}
                >
                  <ProviderCard provider={p} active={active} compact={compact} />
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: compact ? 86 : 110, height: compact ? 86 : 110 }}>
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,87,255,0.75) 0%, rgba(34,197,94,0.3) 40%, rgba(0,87,255,0) 72%)", animation: "athoo-pulse 2.5s ease-in-out infinite" }} />
            <div className="absolute inset-3 rounded-full border-2 border-blue-400/50" style={{ animation: "athoo-spin 8s linear infinite" }} />
            <div className="absolute inset-7 flex items-center justify-center rounded-full bg-blue-600 shadow-[0_0_30px_rgba(0,87,255,.55)]">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="athoo-reveal group relative overflow-hidden rounded-3xl border border-white/8 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(0,87,255,0.08), rgba(8,17,32,0.9))",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <div className="mb-4 text-4xl font-black text-blue-500/30 transition-colors group-hover:text-blue-500/60">{step.num}</div>
              <h3 className="mb-2 text-base font-black text-white">{step.title}</h3>
              <p className="text-sm leading-6 text-slate-400">{step.desc}</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#0057FF] to-emerald-300 transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
