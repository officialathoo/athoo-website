import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ShieldCheck, Star, MapPin, Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles } from "lucide-react";

const PROVIDERS = [
  { name: "Ahmed K.", role: "Master Electrician", rating: 4.9, jobs: 312, icon: Zap, color: "#0057FF" },
  { name: "Bilal R.", role: "Certified Plumber", rating: 4.8, jobs: 228, icon: Droplets, color: "#06b6d4" },
  { name: "Usman T.", role: "AC Specialist", rating: 5.0, jobs: 445, icon: Wind, color: "#10b981" },
  { name: "Tariq S.", role: "Senior Carpenter", rating: 4.7, jobs: 189, icon: Hammer, color: "#FF8A00" },
  { name: "Imran A.", role: "Home Painter", rating: 4.9, jobs: 267, icon: PaintRoller, color: "#a855f7" },
  { name: "Saad M.", role: "Deep Clean Expert", rating: 4.8, jobs: 334, icon: Sparkles, color: "#22c55e" },
];

const STEPS = [
  { num: "01", title: "Post Your Service Request", desc: "Tell Athoo what you need — in seconds." },
  { num: "02", title: "AI-Matched to Providers", desc: "We surface the best-fit verified professionals near you." },
  { num: "03", title: "Confirm & Book", desc: "Chat, compare, and confirm. Your slot is locked." },
  { num: "04", title: "Job Done. Review.", desc: "Rate your provider. Build the trust network." },
];

type Provider = (typeof PROVIDERS)[number];

function ProviderStyles() {
  return (
    <style>{`
      @keyframes providerOrbitSpin { to { transform: rotate(360deg); } }
      @keyframes providerPlanetPulse { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.04); filter: brightness(1.2); } }
      @keyframes providerCardFloat { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-9px,0); } }
      .provider-ring { animation: providerOrbitSpin 16s linear infinite; transform-origin:center; }
      .provider-ring-alt { animation: providerOrbitSpin 20s linear infinite reverse; transform-origin:center; }
      .provider-core { animation: providerPlanetPulse 4.6s ease-in-out infinite; }
      .provider-card-inner { animation: providerCardFloat 5.8s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .provider-ring, .provider-ring-alt, .provider-core, .provider-card-inner { animation: none !important; }
      }
    `}</style>
  );
}

function ProviderOrbitCard({ provider, compact = false }: { provider: Provider; compact?: boolean }) {
  const IconComp = provider.icon;
  return (
    <div
      className="provider-card-inner overflow-hidden rounded-[1.35rem] border p-3 text-center shadow-2xl backdrop-blur-xl sm:rounded-[1.7rem] sm:p-4"
      style={{
        background: `linear-gradient(155deg, rgba(3,8,18,0.96), ${provider.color}1f 60%, rgba(1,13,31,0.98))`,
        borderColor: `${provider.color}52`,
        boxShadow: `0 14px 38px rgba(0,0,0,.42), 0 0 24px ${provider.color}35`,
      }}
    >
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}48` }}>
        <IconComp className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: provider.color }} />
      </div>
      <p className="text-[11px] font-black leading-tight text-white sm:text-sm">{provider.name}</p>
      <p className="mt-1 text-[10px] text-blue-50/75 sm:text-xs">{provider.role}</p>
      <div className="mt-2 flex items-center justify-center gap-1">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="text-[10px] font-black text-amber-300 sm:text-xs">{provider.rating}</span>
        {!compact && <span className="text-xs text-slate-400">· {provider.jobs} jobs</span>}
      </div>
      <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-full border border-green-400/25 bg-green-400/10 px-2 py-1 sm:px-3">
        <ShieldCheck className="h-3 w-3 text-green-300" />
        <span className="text-[10px] font-bold text-green-300 sm:text-xs">Verified</span>
      </div>
    </div>
  );
}

function ProviderPosition({ provider, index, total, rotY, radius, compact }: { provider: Provider; index: number; total: number; rotY: number; radius: number; compact: boolean }) {
  const angle = (index / total) * 360 + rotY;
  const rad = (angle * Math.PI) / 180;
  const x = Math.sin(rad) * radius;
  const z = Math.cos(rad) * radius;
  const t = (z + radius) / (2 * radius);
  const scale = compact ? 0.82 + t * 0.22 : 0.74 + t * 0.34;
  const opacity = 0.62 + t * 0.38;
  const width = compact ? 142 : 185;

  return (
    <div
      className="absolute left-1/2 top-1/2 touch-none select-none"
      style={{
        width,
        transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
        zIndex: Math.round(scale * 100),
        opacity,
        transition: "opacity .12s linear, transform .12s linear",
      }}
    >
      <ProviderOrbitCard provider={provider} compact={compact} />
    </div>
  );
}

function ProviderCore({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className={`${compact ? "h-28 w-28" : "h-36 w-36"} rounded-full bg-blue-500/35 blur-2xl`} />
      <div className={`provider-core absolute left-1/2 top-1/2 ${compact ? "h-20 w-20" : "h-24 w-24"} -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#e0f2fe,#0057FF_40%,#0f172a_78%)] shadow-[0_0_55px_rgba(0,87,255,.58)]`} />
      <div className={`provider-ring absolute left-1/2 top-1/2 ${compact ? "h-32 w-56" : "h-40 w-72"} -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-blue-300/40`} />
      <div className={`provider-ring-alt absolute left-1/2 top-1/2 ${compact ? "h-24 w-52" : "h-32 w-64"} -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[50%] border border-emerald-300/30`} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black text-white drop-shadow-lg">
        <MapPin className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function VirtualShowroom() {
  const [rotY, setRotY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 1024 : false));
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (!dragRef.current.dragging) setRotY((r) => r + (isDesktop ? 0.085 : 0.13));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isDesktop]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { dragging: true, startX: e.clientX, startRot: rotY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * (isDesktop ? 0.28 : 0.45));
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const compact = !isDesktop;
  const radius = compact ? 134 : 360;
  const height = compact ? 370 : 460;

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      <ProviderStyles />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,87,255,0.2),transparent),radial-gradient(ellipse_at_90%_30%,rgba(16,185,129,0.11),transparent_44%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.045)_1px,transparent_1px)] bg-[size:54px_54px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-16">
          <span className="inline-block rounded-full border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-sm font-black text-blue-300 shadow-lg shadow-blue-950/30">
            Meet Athoo Provider
          </span>
          <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">
            Verified <span className="bg-gradient-to-r from-[#4facfe] via-[#00f2fe] to-[#22c55e] bg-clip-text text-transparent">Provider Orbit</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-50/70 sm:text-lg">
            {isDesktop ? "Drag the provider orbit — readable and interactive." : "Rotating provider galaxy — drag or swipe to move the orbit."}
          </p>
        </div>

        <div
          className="relative mx-auto touch-pan-y select-none overflow-visible"
          style={{ height, perspective: compact ? 760 : 1050, cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <ProviderCore compact={compact} />
          {PROVIDERS.map((provider, i) => (
            <ProviderPosition key={provider.name} provider={provider} index={i} total={PROVIDERS.length} radius={radius} rotY={rotY} compact={compact} />
          ))}
        </div>

        <p className="mt-4 text-center text-xs font-bold text-blue-100/70 sm:text-sm">
          Auto-rotating and touch-draggable on mobile and desktop.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
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
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#0057FF] to-[#22c55e] transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
