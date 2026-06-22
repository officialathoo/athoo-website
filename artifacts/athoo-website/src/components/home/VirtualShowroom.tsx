import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Star, Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, MapPin } from "lucide-react";

const PROVIDERS = [
  { name: "Ahmed K.", role: "Expert Electrician", rating: 4.9, jobs: 312, icon: Zap, color: "#0057FF" },
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

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 1024 : false));
  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return desktop;
}

function ProviderGalaxyCore() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 sm:h-52 sm:w-52">
      <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute inset-7 rounded-full bg-gradient-to-br from-sky-300 via-blue-600 to-emerald-500 shadow-2xl shadow-blue-950/60">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.86),transparent_20%),radial-gradient(circle_at_72%_78%,rgba(255,255,255,.14),transparent_38%)]" />
        <MapPin className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white/90" />
      </div>
      <div className="athoo-orbit-ring absolute inset-1 rounded-full border border-cyan-300/45" />
      <div className="athoo-orbit-ring-reverse absolute inset-8 rounded-full border border-emerald-300/35" />
    </div>
  );
}

function ProviderCard({ provider, active=false }: { provider: (typeof PROVIDERS)[number]; active?: boolean }) {
  const IconComp = provider.icon;
  return (
    <div className={`relative h-[190px] w-[220px] shrink-0 overflow-hidden rounded-[1.6rem] border p-4 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 sm:h-[205px] sm:w-[245px] ${active ? "border-white/25" : "border-white/12"}`} style={{ background: `linear-gradient(155deg, rgba(2,8,20,.96), ${provider.color}20 58%, rgba(1,13,31,.98))`, boxShadow: active ? `0 18px 48px ${provider.color}45` : "0 8px 28px rgba(0,0,0,.38)" }}>
      <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl" style={{ background: `${provider.color}44` }} />
      <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}48`, boxShadow: `0 0 18px ${provider.color}38` }}>
        <IconComp className="h-6 w-6" style={{ color: provider.color }} />
      </div>
      <p className="relative truncate text-base font-black text-white">{provider.name}</p>
      <p className="relative mt-1 truncate text-xs text-blue-50/74">{provider.role}</p>
      <div className="relative mt-3 flex items-center justify-center gap-1">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="text-xs font-black text-amber-300">{provider.rating}</span>
        <span className="text-xs text-slate-300">· {provider.jobs} jobs</span>
      </div>
      <div className="relative mt-3 inline-flex items-center justify-center gap-1 rounded-full border border-green-400/25 bg-green-400/10 px-3 py-1">
        <ShieldCheck className="h-3 w-3 text-green-300" />
        <span className="text-xs font-bold text-green-300">Verified Expert</span>
      </div>
    </div>
  );
}

function MobileProviderOrbit() {
  const [active, setActive] = useState(0);
  const drag = useRef({ down: false, x: 0 });
  useEffect(() => {
    const timer = window.setInterval(() => setActive((v) => (v + 1) % PROVIDERS.length), 2800);
    return () => window.clearInterval(timer);
  }, []);
  const onPointerDown = (e: React.PointerEvent) => { drag.current = { down: true, x: e.clientX }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const diff = e.clientX - drag.current.x;
    if (Math.abs(diff) > 45) {
      setActive((v) => (v + (diff < 0 ? 1 : PROVIDERS.length - 1)) % PROVIDERS.length);
      drag.current.x = e.clientX;
    }
  };
  const onPointerUp = () => { drag.current.down = false; };
  return (
    <div className="relative lg:hidden">
      <div className="relative mx-auto h-[430px] max-w-[360px] overflow-hidden rounded-[2rem] border border-cyan-200/10 bg-black/10 px-2 py-8" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <ProviderGalaxyCore />
        <div className="absolute inset-x-0 top-[136px] h-[220px] touch-pan-y select-none">
          {PROVIDERS.map((provider, i) => {
            let delta = i - active;
            if (delta > PROVIDERS.length / 2) delta -= PROVIDERS.length;
            if (delta < -PROVIDERS.length / 2) delta += PROVIDERS.length;
            if (Math.abs(delta) > 2) return null;
            const activeCard = delta === 0;
            return (
              <div key={provider.name} className="absolute left-1/2 top-1/2 transition-transform duration-500 ease-out will-change-transform" style={{ transform: `translate(-50%, -50%) translateX(${delta * 132}px) translateY(${Math.abs(delta) * 8}px) rotateY(${-delta * 16}deg) scale(${activeCard ? 1 : 0.82})`, zIndex: 20 - Math.abs(delta), opacity: activeCard ? 1 : 0.46 }}>
                <ProviderCard provider={provider} active={activeCard} />
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {PROVIDERS.map((p, i) => <button key={p.name} aria-label={`Show ${p.name}`} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-cyan-300" : "w-1.5 bg-white/30"}`} />)}
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-bold text-blue-100/75">Auto-rotating provider galaxy. Swipe or drag cards by hand.</p>
    </div>
  );
}

function DesktopProviderOrbit() {
  const [rotY, setRotY] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef({ dragging: false, startX: 0, startRot: 0 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const tick = () => { if (!drag.current.dragging && !hover) setRotY((r) => r + 0.07); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [hover]);
  const onPointerDown = (e: React.PointerEvent) => { drag.current = { dragging: true, startX: e.clientX, startRot: rotY }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => { if (drag.current.dragging) setRotY(drag.current.startRot + (e.clientX - drag.current.startX) * 0.22); };
  const onPointerUp = () => { drag.current.dragging = false; };
  return (
    <div className="relative mx-auto hidden h-[500px] select-none lg:block" style={{ perspective: 1100, cursor: "grab" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <ProviderGalaxyCore />
      {PROVIDERS.map((provider, i) => {
        const angle = (i / PROVIDERS.length) * 360 + rotY;
        const rad = (angle * Math.PI) / 180;
        const radius = 385;
        const x = Math.sin(rad) * radius;
        const z = Math.cos(rad) * radius;
        const t = (z + radius) / (2 * radius);
        const scale = 0.64 + t * 0.34;
        const opacity = 0.46 + t * 0.54;
        return (
          <div key={provider.name} onMouseEnter={() => setHover(provider.name)} onMouseLeave={() => setHover(null)} className="absolute left-1/2 top-1/2 transition-transform duration-150 will-change-transform" style={{ transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`, zIndex: Math.round(t * 100), opacity }}>
            <ProviderCard provider={provider} active={hover === provider.name || t > 0.72} />
          </div>
        );
      })}
    </div>
  );
}

export default function VirtualShowroom() {
  const isDesktop = useIsDesktop();
  return (
    <section className="relative overflow-hidden bg-[#020617] py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,87,255,0.2),transparent),radial-gradient(ellipse_at_90%_30%,rgba(16,185,129,0.11),transparent_44%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.045)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-block rounded-full border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-sm font-black text-blue-300 shadow-lg shadow-blue-950/30">Meet Athoo Provider</span>
          <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">Verified <span className="bg-gradient-to-r from-[#4facfe] via-[#00f2fe] to-[#22c55e] bg-clip-text text-transparent">Provider Orbit</span></h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-blue-50/72 sm:text-lg">{isDesktop ? "Drag the provider orbit — slower, readable and interactive." : "Readable mobile provider orbit. Swipe or drag cards while the galaxy rotates."}</p>
        </div>
        {isDesktop ? <DesktopProviderOrbit /> : <MobileProviderOrbit />}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="athoo-reveal group relative overflow-hidden rounded-3xl border border-white/8 p-6" style={{ background: "linear-gradient(135deg, rgba(0,87,255,0.08), rgba(8,17,32,0.9))", transitionDelay: `${i * 80}ms` }}>
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
