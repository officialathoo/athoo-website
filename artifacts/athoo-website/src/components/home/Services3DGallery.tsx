import { useEffect, useRef, useState, type PointerEvent } from "react";
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

type Service = (typeof SERVICES)[number];

function GalaxyStyles() {
  return (
    <style>{`
      @keyframes athooOrbitSpin { to { transform: rotate(360deg); } }
      @keyframes athooPlanetPulse { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.04); filter: brightness(1.18); } }
      @keyframes athooFloatCard { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-8px,0); } }
      .athoo-galaxy-ring { animation: athooOrbitSpin 14s linear infinite; transform-origin:center; }
      .athoo-galaxy-ring-alt { animation: athooOrbitSpin 18s linear infinite reverse; transform-origin:center; }
      .athoo-galaxy-core { animation: athooPlanetPulse 4s ease-in-out infinite; }
      .athoo-orbit-card-inner { animation: athooFloatCard 5.4s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .athoo-galaxy-ring, .athoo-galaxy-ring-alt, .athoo-galaxy-core, .athoo-orbit-card-inner { animation: none !important; }
      }
    `}</style>
  );
}

function ServiceOrbitCard({ svc, compact = false }: { svc: Service; compact?: boolean }) {
  const IconComp = svc.icon;
  return (
    <div
      className="athoo-orbit-card-inner rounded-[1.35rem] border p-3 text-center shadow-2xl backdrop-blur-xl sm:rounded-[1.7rem] sm:p-4"
      style={{
        background: `linear-gradient(145deg, rgba(15,10,22,0.94), ${svc.color}1d 58%, rgba(8,17,32,0.98))`,
        borderColor: `${svc.color}55`,
        boxShadow: `0 12px 36px rgba(0,0,0,.38), 0 0 24px ${svc.glow}`,
      }}
    >
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ background: `${svc.color}24`, border: `1px solid ${svc.color}55` }}>
        <IconComp className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: svc.color }} />
      </div>
      <h3 className="text-[11px] font-black leading-tight text-white sm:text-sm">{svc.name}</h3>
      {!compact && <p className="mt-2 text-[11px] leading-4 text-orange-50/75 sm:text-xs sm:leading-5">{svc.desc}</p>}
      <span className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black sm:mt-3 sm:px-3 sm:text-xs" style={{ background: `${svc.color}20`, color: svc.color }}>
        Explore <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}

function OrbitCardPosition({ svc, index, total, rotY, radius, compact }: { svc: Service; index: number; total: number; rotY: number; radius: number; compact: boolean }) {
  const angle = (index / total) * 360 + rotY;
  const rad = (angle * Math.PI) / 180;
  const x = Math.sin(rad) * radius;
  const z = Math.cos(rad) * radius;
  const t = (z + radius) / (2 * radius);
  const scale = compact ? 0.78 + t * 0.28 : 0.78 + t * 0.34;
  const opacity = 0.58 + t * 0.42;
  const width = compact ? 138 : 220;

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
      <ServiceOrbitCard svc={svc} compact={compact} />
    </div>
  );
}

function GalaxyCore({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className={`${compact ? "h-28 w-28" : "h-36 w-36"} rounded-full bg-orange-500/30 blur-2xl`} />
      <div className={`athoo-galaxy-core absolute left-1/2 top-1/2 ${compact ? "h-20 w-20" : "h-24 w-24"} -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff7ed,#FF8A00_35%,#ef4444_72%)] shadow-[0_0_55px_rgba(255,138,0,.55)]`} />
      <div className={`athoo-galaxy-ring absolute left-1/2 top-1/2 ${compact ? "h-32 w-56" : "h-40 w-72"} -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-orange-300/35`} />
      <div className={`athoo-galaxy-ring-alt absolute left-1/2 top-1/2 ${compact ? "h-24 w-52" : "h-32 w-64"} -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[50%] border border-red-300/25`} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black text-white drop-shadow-lg">PK</div>
    </div>
  );
}

export default function Services3DGallery() {
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
      if (!dragRef.current.dragging) setRotY((r) => r + (isDesktop ? 0.075 : 0.12));
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
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * (isDesktop ? 0.25 : 0.42));
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const compact = !isDesktop;
  const radius = compact ? 142 : 430;
  const height = compact ? 380 : 540;

  return (
    <section className="relative overflow-hidden bg-[#14070a] py-20 sm:py-28">
      <GalaxyStyles />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,138,0,0.18),transparent_52%),radial-gradient(ellipse_at_80%_80%,rgba(239,68,68,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,138,0,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,0,.055)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <span className="inline-block rounded-full border border-orange-400/40 bg-orange-400/15 px-4 py-2 text-sm font-black text-orange-300 shadow-lg shadow-orange-950/30">
            Explore Our Services Gallery
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Service <span className="bg-gradient-to-r from-[#FF8A00] via-[#fb7185] to-[#facc15] bg-clip-text text-transparent">Experience Deck</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-orange-50/70 sm:text-lg">
            {isDesktop ? "Drag the rotating deck to explore Athoo service categories." : "Rotating service galaxy — drag or swipe to move the orbit."}
          </p>
        </div>

        <div
          className="relative mx-auto touch-pan-y select-none overflow-visible"
          style={{ height, perspective: compact ? 760 : 1200, cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <GalaxyCore compact={compact} />
          {SERVICES.map((svc, i) => (
            <OrbitCardPosition key={svc.id} svc={svc} index={i} total={SERVICES.length} radius={radius} rotY={rotY} compact={compact} />
          ))}
        </div>

        <p className="mt-4 text-center text-xs font-bold text-orange-100/70 sm:text-sm">
          Auto-rotating and touch-draggable on mobile and desktop.
        </p>
      </div>
    </section>
  );
}
