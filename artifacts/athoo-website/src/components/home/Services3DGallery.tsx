import { useEffect, useRef, useState } from "react";
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

function ServiceCard({ svc, index = 0 }: { svc: (typeof SERVICES)[number]; index?: number }) {
  const IconComp = svc.icon;
  return (
    <div
      className="service-mobile-card group relative min-h-[180px] overflow-hidden rounded-3xl border border-orange-300/15 p-4 text-left shadow-2xl shadow-orange-950/20 transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: `linear-gradient(145deg, rgba(15,10,22,0.94), ${svc.color}18 55%, rgba(8,17,32,0.98))`,
        animationDelay: `${index * 120}ms`,
      }}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl" style={{ background: svc.glow }} />
      <div
        className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: `${svc.color}24`, border: `1px solid ${svc.color}55`, boxShadow: `0 0 20px ${svc.glow}` }}
      >
        <IconComp className="h-6 w-6" style={{ color: svc.color }} />
      </div>
      <h3 className="relative text-sm font-black text-white">{svc.name}</h3>
      <p className="relative mt-2 text-xs leading-5 text-orange-50/75">{svc.desc}</p>
      <span className="relative mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black" style={{ background: `${svc.color}20`, color: svc.color }}>
        Explore <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}

function MobileServiceGallery() {
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
    <div className="service-mobile-stage relative lg:hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/25" style={{ animation: "athooGalaxyRing 18s linear infinite" }} />
      <div
        ref={scrollerRef}
        className="athoo-mobile-scroll relative -mx-4 flex gap-4 px-4 py-6 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onPointerLeave={stopDrag}
        aria-label="Swipe Athoo services gallery"
      >
        {SERVICES.map((svc, index) => (
          <div key={svc.id} className="athoo-mobile-snap w-[235px] shrink-0 sm:w-[270px]">
            <ServiceCard svc={svc} index={index} />
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-xs font-bold text-orange-100/70">Swipe the service galaxy · cards stay readable on mobile</p>
    </div>
  );
}

export default function Services3DGallery() {
  const [rotY, setRotY] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
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
      if (!dragRef.current.dragging) setRotY((r) => r + 0.08);
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
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * 0.25);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const total = SERVICES.length;
  const radius = 430;

  return (
    <section className="relative overflow-hidden bg-[#14070a] py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,138,0,0.18),transparent_52%),radial-gradient(ellipse_at_80%_80%,rgba(239,68,68,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,138,0,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,138,0,.055)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-orange-400/40 bg-orange-400/15 px-4 py-2 text-sm font-black text-orange-300 shadow-lg shadow-orange-950/30">
            Explore Our Services Gallery
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Service{" "}
            <span className="bg-gradient-to-r from-[#FF8A00] via-[#fb7185] to-[#facc15] bg-clip-text text-transparent">
              Experience Deck
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-orange-50/70">
            {isDesktop ? "Drag the deck to explore Athoo service categories." : "A mobile animated gallery of Athoo service categories."}
          </p>
        </div>

        <MobileServiceGallery />

        {isDesktop && (
          <div
            className="relative mx-auto hidden select-none lg:block"
            style={{ height: 540, perspective: 1200, cursor: "grab" }}
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
                const t = (z + radius) / (2 * radius);
                const scale = 0.78 + t * 0.34;
                const opacity = 0.72 + t * 0.28;
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
                      opacity,
                      width: 220,
                      transition: "opacity 0.12s, transform 0.12s",
                    }}
                  >
                    <div
                      className="rounded-[2rem] border p-5 text-center transition-all duration-300"
                      style={{
                        background: isHov ? `linear-gradient(135deg, ${svc.color}26, rgba(20,7,10,0.96))` : "rgba(20,7,10,0.92)",
                        backdropFilter: "blur(14px)",
                        boxShadow: isHov ? `0 0 34px ${svc.glow}` : "0 8px 32px rgba(0,0,0,0.48)",
                        border: isHov ? `1px solid ${svc.color}70` : "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${svc.color}28`, boxShadow: `0 0 20px ${svc.glow}`, border: `1px solid ${svc.color}48` }}>
                        <IconComp className="h-7 w-7" style={{ color: svc.color }} />
                      </div>
                      <h3 className="text-sm font-black text-white">{svc.name}</h3>
                      <p className="mt-2 text-xs font-medium leading-5 text-orange-50/75">{svc.desc}</p>
                      <span className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-black" style={{ background: `${svc.color}22`, color: svc.color }}>
                        Launching Soon
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/40 blur-2xl" />
          </div>
        )}
      </div>
    </section>
  );
}
