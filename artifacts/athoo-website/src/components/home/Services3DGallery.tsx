import { useEffect, useMemo, useRef, useState } from "react";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home, Wrench, ArrowRight } from "lucide-react";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Electrical repairs, wiring and fixtures", icon: Zap, color: "#FF8A00", glow: "rgba(255,138,0,0.34)" },
  { id: "plumber", name: "Plumber", desc: "Leaks, pipes and bathroom fittings", icon: Droplets, color: "#06b6d4", glow: "rgba(6,182,212,0.34)" },
  { id: "ac", name: "AC Service", desc: "AC maintenance and repair", icon: Wind, color: "#38bdf8", glow: "rgba(56,189,248,0.34)" },
  { id: "carpenter", name: "Carpenter", desc: "Furniture, doors and woodwork", icon: Hammer, color: "#f59e0b", glow: "rgba(245,158,11,0.34)" },
  { id: "painter", name: "Painter", desc: "Interior and exterior painting", icon: PaintRoller, color: "#fb7185", glow: "rgba(251,113,133,0.34)" },
  { id: "cleaning", name: "Cleaning", desc: "Home and office deep cleaning", icon: Sparkles, color: "#22c55e", glow: "rgba(34,197,94,0.34)" },
  { id: "appliance", name: "Appliance Repair", desc: "Fridge, washer, microwave and more", icon: Tv, color: "#ef4444", glow: "rgba(239,68,68,0.34)" },
  { id: "maintenance", name: "Home Maintenance", desc: "Routine handyman support", icon: Home, color: "#a855f7", glow: "rgba(168,85,247,0.34)" },
  { id: "more", name: "More Coming Soon", desc: "10+ service categories planned", icon: Wrench, color: "#0057FF", glow: "rgba(0,87,255,0.34)" },
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

function GalaxyCore({ tone = "service" }: { tone?: "service" | "provider" }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 sm:h-52 sm:w-52">
      <div className={`absolute inset-0 rounded-full blur-3xl ${tone === "service" ? "bg-orange-500/30" : "bg-blue-500/30"}`} />
      <div className={`absolute inset-7 rounded-full shadow-2xl ${tone === "service" ? "bg-gradient-to-br from-orange-300 via-orange-500 to-red-600 shadow-orange-950/60" : "bg-gradient-to-br from-sky-300 via-blue-600 to-cyan-700 shadow-blue-950/60"}`}>
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.85),transparent_20%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,.12),transparent_40%)]" />
      </div>
      <div className={`athoo-orbit-ring absolute inset-1 rounded-full border ${tone === "service" ? "border-orange-300/45" : "border-cyan-300/45"}`} />
      <div className={`athoo-orbit-ring-reverse absolute inset-8 rounded-full border ${tone === "service" ? "border-red-300/35" : "border-green-300/35"}`} />
      <div className="absolute inset-0 rounded-full border border-white/5" />
    </div>
  );
}

function ServiceCard({ svc, active = false }: { svc: (typeof SERVICES)[number]; active?: boolean }) {
  const IconComp = svc.icon;
  return (
    <div
      className={`relative h-[178px] w-[218px] shrink-0 overflow-hidden rounded-[1.6rem] border p-4 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 sm:h-[192px] sm:w-[242px] ${active ? "border-white/25" : "border-white/12"}`}
      style={{
        background: `linear-gradient(145deg, rgba(16,7,12,.94), ${svc.color}1f 55%, rgba(8,13,24,.96))`,
        boxShadow: active ? `0 18px 48px ${svc.glow}` : "0 8px 28px rgba(0,0,0,.38)",
      }}
    >
      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full blur-2xl" style={{ background: svc.glow }} />
      <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${svc.color}24`, border: `1px solid ${svc.color}58`, boxShadow: `0 0 20px ${svc.glow}` }}>
        <IconComp className="h-6 w-6" style={{ color: svc.color }} />
      </div>
      <h3 className="relative whitespace-normal text-base font-black leading-tight text-white">{svc.name}</h3>
      <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-orange-50/78">{svc.desc}</p>
      <span className="relative mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black" style={{ background: `${svc.color}22`, color: svc.color }}>
        Explore <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}

function MobileServiceOrbit() {
  const [active, setActive] = useState(0);
  const drag = useRef({ down: false, x: 0 });
  useEffect(() => {
    const timer = window.setInterval(() => setActive((v) => (v + 1) % SERVICES.length), 2600);
    return () => window.clearInterval(timer);
  }, []);
  const onPointerDown = (e: React.PointerEvent) => { drag.current = { down: true, x: e.clientX }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const diff = e.clientX - drag.current.x;
    if (Math.abs(diff) > 45) {
      setActive((v) => (v + (diff < 0 ? 1 : SERVICES.length - 1)) % SERVICES.length);
      drag.current.x = e.clientX;
    }
  };
  const onPointerUp = () => { drag.current.down = false; };

  return (
    <div className="relative lg:hidden">
      <div className="relative mx-auto h-[420px] max-w-[360px] overflow-hidden rounded-[2rem] border border-orange-200/10 bg-black/10 px-2 py-8" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <GalaxyCore tone="service" />
        <div className="absolute inset-x-0 top-[130px] h-[215px] touch-pan-y select-none">
          {SERVICES.map((svc, i) => {
            let delta = i - active;
            if (delta > SERVICES.length / 2) delta -= SERVICES.length;
            if (delta < -SERVICES.length / 2) delta += SERVICES.length;
            if (Math.abs(delta) > 2) return null;
            const activeCard = delta === 0;
            return (
              <div
                key={svc.id}
                className="absolute left-1/2 top-1/2 transition-transform duration-500 ease-out will-change-transform"
                style={{
                  transform: `translate(-50%, -50%) translateX(${delta * 132}px) translateY(${Math.abs(delta) * 8}px) rotateY(${-delta * 16}deg) scale(${activeCard ? 1 : 0.82})`,
                  zIndex: 20 - Math.abs(delta),
                  opacity: activeCard ? 1 : 0.46,
                }}
              >
                <ServiceCard svc={svc} active={activeCard} />
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {SERVICES.map((svc, i) => <button key={svc.id} aria-label={`Show ${svc.name}`} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-orange-300" : "w-1.5 bg-white/30"}`} />)}
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-bold text-orange-100/75">Auto-rotating galaxy. Swipe or drag cards by hand.</p>
    </div>
  );
}

function DesktopServiceOrbit() {
  const [rotY, setRotY] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef({ dragging: false, startX: 0, startRot: 0 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const tick = () => { if (!drag.current.dragging && !hover) setRotY((r) => r + 0.075); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [hover]);
  const onPointerDown = (e: React.PointerEvent) => { drag.current = { dragging: true, startX: e.clientX, startRot: rotY }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => { if (drag.current.dragging) setRotY(drag.current.startRot + (e.clientX - drag.current.startX) * 0.22); };
  const onPointerUp = () => { drag.current.dragging = false; };

  return (
    <div className="relative mx-auto hidden h-[500px] select-none lg:block" style={{ perspective: 1100, cursor: "grab" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <GalaxyCore tone="service" />
      {SERVICES.map((svc, i) => {
        const angle = (i / SERVICES.length) * 360 + rotY;
        const rad = (angle * Math.PI) / 180;
        const radius = 410;
        const x = Math.sin(rad) * radius;
        const z = Math.cos(rad) * radius;
        const t = (z + radius) / (2 * radius);
        const scale = 0.62 + t * 0.34;
        const opacity = 0.42 + t * 0.58;
        return (
          <div key={svc.id} onMouseEnter={() => setHover(svc.id)} onMouseLeave={() => setHover(null)} className="absolute left-1/2 top-1/2 transition-transform duration-150 will-change-transform" style={{ transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`, zIndex: Math.round(t * 100), opacity }}>
            <ServiceCard svc={svc} active={hover === svc.id || t > 0.72} />
          </div>
        );
      })}
    </div>
  );
}

export default function Services3DGallery() {
  const isDesktop = useIsDesktop();
  return (
    <section className="relative overflow-hidden bg-[#140506] py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,138,0,.22),transparent_28%),radial-gradient(circle_at_90%_45%,rgba(239,68,68,.16),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,138,0,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,0,.055)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-orange-300/35 bg-orange-400/12 px-4 py-2 text-sm font-black text-orange-200 shadow-lg shadow-orange-950/20">Explore Our Services Gallery</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Service <span className="bg-gradient-to-r from-[#FF8A00] via-red-400 to-pink-400 bg-clip-text text-transparent">Galaxy</span></h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-orange-50/72 sm:text-lg">Readable rotating cards with touch drag on mobile and desktop. Swipe to move the orbit.</p>
        </div>
        {isDesktop ? <DesktopServiceOrbit /> : <MobileServiceOrbit />}
      </div>
    </section>
  );
}
