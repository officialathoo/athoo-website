import { useRef, useEffect, useState } from "react";
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

function MobileGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SERVICES.map((svc) => {
        const IconComp = svc.icon;
        return (
          <div
            key={svc.id}
            className="group rounded-2xl border border-white/10 p-4 text-center transition-all duration-300 hover:-translate-y-1"
            style={{ background: "rgba(8,17,32,0.8)", backdropFilter: "blur(12px)" }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: `${svc.color}22`, border: `1px solid ${svc.color}40` }}
            >
              <IconComp className="h-6 w-6" style={{ color: svc.color }} />
            </div>
            <h3 className="text-sm font-black text-white">{svc.name}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400 hidden sm:block">{svc.desc}</p>
            <span
              className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-black"
              style={{ background: `${svc.color}20`, color: svc.color }}
            >
              Soon
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Services3DGallery() {
  const [rotY, setRotY] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const tick = () => {
      if (!dragRef.current.dragging) setRotY((r) => r + 0.18);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isMobile]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startRot: rotY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * 0.3);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const total = SERVICES.length;
  const radius = 380;

  return (
    <section className="relative overflow-hidden bg-[#050b1a] py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,87,255,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-black text-orange-400">
            Virtual Service Showroom
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-[#0057FF] to-[#FF8A00] bg-clip-text text-transparent">
              Service Galaxy
            </span>
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-400">
            {isMobile ? "10+ categories launching across Pakistan" : "Drag to rotate — 10+ categories launching across Pakistan"}
          </p>
        </div>

        {isMobile ? (
          <MobileGrid />
        ) : (
          <div
            className="relative mx-auto select-none"
            style={{ height: 500, perspective: 1100, cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
              {SERVICES.map((svc, i) => {
                const angle = (i / total) * 360 + rotY;
                const rad = (angle * Math.PI) / 180;
                const x = Math.sin(rad) * radius;
                const z = Math.cos(rad) * radius;
                const scale = (z + radius) / (2 * radius);
                const isHov = hovered === svc.id;
                const IconComp = svc.icon;

                return (
                  <div
                    key={svc.id}
                    onMouseEnter={() => setHovered(svc.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
                      zIndex: Math.round(scale * 100),
                      opacity: 0.4 + scale * 0.6,
                      width: 190,
                    }}
                  >
                    <div
                      className="rounded-3xl border p-5 text-center transition-all duration-300"
                      style={{
                        background: isHov ? `linear-gradient(135deg, ${svc.color}22, ${svc.color}11)` : "rgba(8,17,32,0.85)",
                        backdropFilter: "blur(12px)",
                        boxShadow: isHov ? `0 0 32px ${svc.glow}, inset 0 0 20px ${svc.color}08` : "0 8px 32px rgba(0,0,0,0.4)",
                        border: isHov ? `1px solid ${svc.color}50` : "1px solid rgba(255,255,255,0.08)",
                        transform: isHov ? "translateY(-8px)" : "none",
                      }}
                    >
                      <div
                        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${svc.color}33, ${svc.color}11)`,
                          boxShadow: `0 0 20px ${svc.glow}`,
                          border: `1px solid ${svc.color}40`,
                        }}
                      >
                        <IconComp className="h-7 w-7" style={{ color: svc.color }} />
                      </div>
                      <h3 className="text-sm font-black text-white">{svc.name}</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-400">{svc.desc}</p>
                      <span
                        className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-black"
                        style={{ background: `${svc.color}20`, color: svc.color }}
                      >
                        Launching Soon
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 80, height: 80,
                background: "radial-gradient(circle, rgba(0,87,255,0.6), rgba(0,87,255,0))",
                boxShadow: "0 0 60px rgba(0,87,255,0.5)",
                filter: "blur(2px)",
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
