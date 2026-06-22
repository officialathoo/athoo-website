import { useEffect, useMemo, useRef, useState } from "react";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home, Wrench } from "lucide-react";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Electrical repairs, wiring and fixtures", icon: Zap, color: "#0057FF", glow: "rgba(0,87,255,0.35)" },
  { id: "plumber", name: "Plumber", desc: "Leaks, pipes and bathroom fittings", icon: Droplets, color: "#06b6d4", glow: "rgba(6,182,212,0.35)" },
  { id: "ac", name: "AC Service", desc: "AC maintenance and repair", icon: Wind, color: "#10b981", glow: "rgba(16,185,129,0.35)" },
  { id: "carpenter", name: "Carpenter", desc: "Furniture, doors and woodwork", icon: Hammer, color: "#FF8A00", glow: "rgba(255,138,0,0.35)" },
  { id: "painter", name: "Painter", desc: "Interior and exterior painting", icon: PaintRoller, color: "#a855f7", glow: "rgba(168,85,247,0.35)" },
  { id: "cleaning", name: "Cleaning", desc: "Home and office deep cleaning", icon: Sparkles, color: "#22c55e", glow: "rgba(34,197,94,0.35)" },
  { id: "appliance", name: "Appliance Repair", desc: "Fridge, washer, microwave and more", icon: Tv, color: "#ef4444", glow: "rgba(239,68,68,0.35)" },
  { id: "maintenance", name: "Home Maintenance", desc: "Routine handyman support", icon: Home, color: "#6366f1", glow: "rgba(99,102,241,0.35)" },
  { id: "more", name: "More Coming Soon", desc: "10+ service categories planned", icon: Wrench, color: "#0057FF", glow: "rgba(0,87,255,0.35)" },
];

type Service = (typeof SERVICES)[number];

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

function ServiceCard({ svc, active = false, compact = false }: { svc: Service; active?: boolean; compact?: boolean }) {
  const IconComp = svc.icon;
  return (
    <div
      className="h-full rounded-3xl border p-4 text-center shadow-2xl transition-transform duration-300 sm:p-5"
      style={{
        background: active
          ? `linear-gradient(135deg, ${svc.color}28, rgba(8,17,32,0.96))`
          : "rgba(8,17,32,0.94)",
        borderColor: active ? `${svc.color}70` : "rgba(255,255,255,0.12)",
        boxShadow: active ? `0 0 34px ${svc.glow}` : "0 12px 36px rgba(0,0,0,0.42)",
      }}
    >
      <div
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
        style={{
          background: `linear-gradient(135deg, ${svc.color}35, ${svc.color}12)`,
          boxShadow: `0 0 20px ${svc.glow}`,
          border: `1px solid ${svc.color}45`,
        }}
      >
        <IconComp className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: svc.color }} />
      </div>
      <h3 className="text-sm font-black text-white sm:text-base">{svc.name}</h3>
      <p className="mt-1 text-xs font-medium leading-5 text-slate-300">{compact ? svc.desc.split(",")[0] : svc.desc}</p>
      <span
        className="mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide"
        style={{ background: `${svc.color}22`, color: svc.color }}
      >
        Launching Soon
      </span>
    </div>
  );
}

export default function Services3DGallery() {
  const compact = useIsCompact();
  const [rotY, setRotY] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0, moved: false });
  const frameRef = useRef<number>(0);
  const total = SERVICES.length;

  useEffect(() => {
    const tick = () => {
      if (!dragRef.current.dragging && !hovered) setRotY((r) => r + (compact ? 0.22 : 0.11));
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
    setRotY(dragRef.current.startRot + delta * (compact ? 0.75 : 0.32));
  };

  const finishDrag = () => {
    if (compact && dragRef.current.moved) {
      const step = 360 / total;
      setRotY((r) => Math.round(r / step) * step);
    }
    dragRef.current.dragging = false;
  };

  const radius = compact ? 118 : 360;
  const cardWidth = compact ? 156 : 190;
  const activeIndex = useMemo(() => {
    const step = 360 / total;
    return ((Math.round((-rotY % 360) / step) % total) + total) % total;
  }, [rotY, total]);

  return (
    <section className="relative overflow-hidden bg-[#050b1a] py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,0,0.16),transparent_64%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,138,0,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-black text-orange-400">
            Virtual Service Showroom
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-[#FF8A00] via-orange-300 to-[#0057FF] bg-clip-text text-transparent">
              Service Galaxy
            </span>
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-400">
            10+ trusted home service categories launching across Pakistan.
          </p>
        </div>

        <div
          className="relative mx-auto select-none touch-pan-y"
          style={{ height: compact ? 360 : 500, perspective: compact ? 850 : 1100, cursor: dragRef.current.dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerLeave={finishDrag}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-orange-400/20" style={{ width: compact ? 235 : 690, height: compact ? 235 : 360, transform: "translate(-50%, -50%) rotateX(64deg)", animation: "athoo-spin 18s linear infinite" }} />
          <div className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-blue-400/15" style={{ width: compact ? 285 : 780, height: compact ? 285 : 420, transform: "translate(-50%, -50%) rotateX(64deg)", animation: "athoo-spin 24s linear infinite reverse" }} />

          <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {SERVICES.map((svc, i) => {
              const angle = (i / total) * 360 + rotY;
              const rad = (angle * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const z = Math.cos(rad) * radius;
              const depth = (z + radius) / (2 * radius);
              const scale = compact ? 0.78 + depth * 0.32 : 0.66 + depth * 0.44;
              const opacity = compact ? 0.38 + depth * 0.62 : 0.55 + depth * 0.45;
              const active = compact ? i === activeIndex : depth > 0.7 || hovered === svc.id;
              return (
                <div
                  key={svc.id}
                  onMouseEnter={() => setHovered(svc.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: cardWidth,
                    transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${compact ? z * 0.24 : z * 0.1}px) scale(${scale})`,
                    zIndex: Math.round(scale * 100 + z),
                    opacity,
                    filter: compact && !active ? "blur(0.2px)" : "none",
                    transition: dragRef.current.dragging ? "none" : "opacity 180ms ease, transform 220ms ease, filter 220ms ease",
                    pointerEvents: active ? "auto" : "none",
                  }}
                >
                  <ServiceCard svc={svc} active={active} compact={compact} />
                </div>
              );
            })}
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: compact ? 74 : 90,
              height: compact ? 74 : 90,
              background: "radial-gradient(circle, rgba(255,138,0,0.7), rgba(0,87,255,0.18), rgba(0,87,255,0))",
              boxShadow: "0 0 60px rgba(255,138,0,0.35), 0 0 80px rgba(0,87,255,0.28)",
              animation: "athoo-pulse 2.6s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}
