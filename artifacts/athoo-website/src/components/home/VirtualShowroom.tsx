import { useEffect, useRef, useState } from "react";
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

function ProviderCard({ provider, index = 0 }: { provider: (typeof PROVIDERS)[number]; index?: number }) {
  const IconComp = provider.icon;
  return (
    <div
      className="provider-mobile-card relative min-h-[190px] overflow-hidden rounded-3xl border border-blue-300/15 p-4 text-center shadow-2xl shadow-blue-950/20"
      style={{
        background: `linear-gradient(155deg, rgba(3,8,18,0.96), ${provider.color}18 60%, rgba(1,13,31,0.98))`,
        animationDelay: `${index * 140}ms`,
      }}
    >
      <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full blur-2xl" style={{ background: `${provider.color}44` }} />
      <div className="absolute -bottom-12 right-0 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}48`, boxShadow: `0 0 18px ${provider.color}38` }}>
        <IconComp className="h-6 w-6" style={{ color: provider.color }} />
      </div>
      <p className="relative text-sm font-black text-white">{provider.name}</p>
      <p className="relative mt-1 text-xs text-blue-50/70">{provider.role}</p>
      <div className="relative mt-3 flex items-center justify-center gap-1">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="text-xs font-black text-amber-300">{provider.rating}</span>
        <span className="text-xs text-slate-400">· {provider.jobs} jobs</span>
      </div>
      <div className="relative mt-3 inline-flex items-center justify-center gap-1 rounded-full border border-green-400/25 bg-green-400/10 px-3 py-1">
        <ShieldCheck className="h-3 w-3 text-green-300" />
        <span className="text-xs font-bold text-green-300">Verified Expert</span>
      </div>
    </div>
  );
}

function MobileProviderGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.dataset.dragging = "true";
    el.dataset.startX = String(event.clientX);
    el.dataset.scrollLeft = String(el.scrollLeft);
    el.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || el.dataset.dragging !== "true") return;
    const startX = Number(el.dataset.startX || 0);
    const startScroll = Number(el.dataset.scrollLeft || 0);
    el.scrollLeft = startScroll - (event.clientX - startX);
  };

  const stopDrag = () => {
    const el = scrollerRef.current;
    if (el) el.dataset.dragging = "false";
  };

  return (
    <div className="provider-mobile-stage relative lg:hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/25" style={{ animation: "athooGalaxyRing 20s linear infinite reverse" }} />
      <div
        ref={scrollerRef}
        className="athoo-mobile-scroll relative -mx-4 flex gap-4 px-4 py-6 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onPointerLeave={stopDrag}
        aria-label="Swipe Athoo verified providers gallery"
      >
        {PROVIDERS.map((provider, index) => (
          <div key={provider.name} className="athoo-mobile-snap w-[235px] shrink-0 sm:w-[270px]">
            <ProviderCard provider={provider} index={index} />
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-xs font-bold text-blue-100/70">Swipe verified providers · galaxy motion works on mobile</p>
    </div>
  );
}

function ProviderNode({ provider, angle, radius, rotY }: { provider: (typeof PROVIDERS)[number]; angle: number; radius: number; rotY: number }) {
  const [hovered, setHovered] = useState(false);
  const totalAngle = angle + rotY;
  const rad = (totalAngle * Math.PI) / 180;
  const x = Math.sin(rad) * radius;
  const z = Math.cos(rad) * radius;
  const t = (z + radius) / (2 * radius);
  const scale = 0.72 + t * 0.34;
  const opacity = 0.68 + t * 0.32;
  const IconComp = provider.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 185,
        transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
        zIndex: Math.round(scale * 100),
        opacity,
        transition: "opacity 0.12s, transform 0.12s",
      }}
    >
      <div
        className="rounded-[1.7rem] p-4 text-center transition-all duration-300"
        style={{
          background: hovered ? `linear-gradient(135deg, ${provider.color}2e, rgba(3,8,18,0.96))` : "rgba(3,8,18,0.93)",
          backdropFilter: "blur(16px)",
          border: hovered ? `1px solid ${provider.color}70` : "1px solid rgba(255,255,255,0.13)",
          boxShadow: hovered ? `0 0 32px ${provider.color}42` : "0 4px 24px rgba(0,0,0,0.48)",
        }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}40` }}>
          <IconComp className="h-6 w-6" style={{ color: provider.color }} />
        </div>
        <p className="text-sm font-black text-white">{provider.name}</p>
        <p className="text-xs text-blue-50/70">{provider.role}</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-300">{provider.rating}</span>
          <span className="text-xs text-slate-400">· {provider.jobs} jobs</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3 text-green-300" />
          <span className="text-xs font-bold text-green-300">Verified</span>
        </div>
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
    if (!isDesktop) return undefined;
    const tick = () => {
      if (!dragRef.current.dragging) setRotY((r) => r + 0.09);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isDesktop]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startRot: rotY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * 0.28);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  return (
    <section className="relative overflow-hidden bg-[#020617] py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,87,255,0.2),transparent),radial-gradient(ellipse_at_90%_30%,rgba(16,185,129,0.11),transparent_44%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.045)_1px,transparent_1px)] bg-[size:54px_54px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="inline-block rounded-full border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-sm font-black text-blue-300 shadow-lg shadow-blue-950/30">
            Meet Athoo Provider
          </span>
          <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">
            Verified{" "}
            <span className="bg-gradient-to-r from-[#4facfe] via-[#00f2fe] to-[#22c55e] bg-clip-text text-transparent">
              Provider Orbit
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50/70">
            {isDesktop ? "Drag the provider orbit — slower, readable and interactive." : "Mobile-friendly animated showcase of verified Athoo professionals."}
          </p>
        </div>

        <MobileProviderGallery />

        {isDesktop && (
          <div
            className="relative mx-auto hidden select-none lg:block"
            style={{ height: 460, perspective: 1050, cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {PROVIDERS.map((p, i) => (
              <ProviderNode key={p.name} provider={p} angle={(i / PROVIDERS.length) * 360} radius={360} rotY={rotY} />
            ))}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-2xl" />
              <div className="absolute inset-4 rounded-full border-2 border-blue-400/45" style={{ animation: "athoo-spin 10s linear infinite" }} />
              <div className="absolute inset-8 flex items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-900/50">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
