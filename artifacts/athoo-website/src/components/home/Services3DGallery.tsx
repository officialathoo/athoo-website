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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : true,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

function MobileServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, startX: 0 });
  const total = SERVICES.length;

  const next = () => setActiveIndex((i) => (i + 1) % total);
  const prev = () => setActiveIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (isDragging) return;
    const timer = window.setInterval(next, 3600);
    return () => window.clearInterval(timer);
  }, [isDragging, total]);

  const visible = useMemo(() => [-1, 0, 1].map((offset) => {
    const index = (activeIndex + offset + total) % total;
    return { item: SERVICES[index], offset };
  }), [activeIndex, total]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, startX: event.clientX };
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const diff = event.clientX - dragRef.current.startX;
    setDragOffset(Math.max(-105, Math.min(105, diff)));
  };

  const finishDrag = () => {
    if (!dragRef.current.active) return;
    if (dragOffset < -40) next();
    if (dragOffset > 40) prev();
    dragRef.current.active = false;
    setDragOffset(0);
    window.setTimeout(() => setIsDragging(false), 250);
  };

  return (
    <div className="relative mx-auto w-full max-w-[420px] overflow-hidden px-1 pb-8 pt-2">
      <div
        className="relative h-[286px] touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
      >
        <div className="pointer-events-none absolute inset-x-6 top-12 h-44 rounded-full bg-orange-500/10 blur-3xl" />
        {visible.map(({ item, offset }) => {
          const IconComp = item.icon;
          const isCenter = offset === 0;
          const x = offset * 128 + dragOffset;
          return (
            <article
              key={`${item.id}-${offset}`}
              className="absolute left-1/2 top-4 w-[218px] rounded-[1.7rem] border p-5 text-center shadow-2xl transition-[transform,opacity,filter] duration-500 ease-out"
              style={{
                transform: `translate3d(calc(-50% + ${x}px), ${isCenter ? 0 : 20}px, 0) scale(${isCenter ? 1 : 0.82})`,
                opacity: isCenter ? 1 : 0.44,
                zIndex: isCenter ? 20 : 8,
                filter: isCenter ? "none" : "blur(0.2px)",
                background: isCenter
                  ? `linear-gradient(145deg, rgba(8,17,32,0.96), ${item.color}18)`
                  : "rgba(8,17,32,0.78)",
                borderColor: isCenter ? `${item.color}60` : "rgba(255,255,255,0.1)",
                boxShadow: isCenter ? `0 22px 60px ${item.glow}` : "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: `${item.color}24`, border: `1px solid ${item.color}45` }}
              >
                <IconComp className="h-7 w-7" style={{ color: item.color }} />
              </div>
              <h3 className="text-base font-black text-white">{item.name}</h3>
              <p className="mt-2 min-h-[42px] text-xs font-medium leading-5 text-slate-300">{item.desc}</p>
              <span
                className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-black"
                style={{ background: `${item.color}22`, color: item.color }}
              >
                Launching Soon
              </span>
            </article>
          );
        })}
      </div>
      <div className="mt-1 flex justify-center gap-2">
        {SERVICES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show ${item.name}`}
            onClick={() => setActiveIndex(index)}
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: activeIndex === index ? 22 : 9,
              background: activeIndex === index ? "#FF8A00" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Services3DGallery() {
  const [rotY, setRotY] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isMobile) return;
    const tick = () => {
      if (!dragRef.current.dragging) setRotY((r) => r + 0.1);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isMobile]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { dragging: true, startX: e.clientX, startRot: rotY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging) return;
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * 0.25);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  const total = SERVICES.length;
  const radius = 360;

  return (
    <section className="relative overflow-hidden bg-[#050b1a] py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,0,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,138,0,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.035)_1px,transparent_1px)] bg-[size:48px_48px]" />

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
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-400">
            A preview of Athoo service categories launching for homes and businesses in Pakistan.
          </p>
        </div>

        {isMobile ? (
          <MobileServiceCarousel />
        ) : (
          <div
            className="relative mx-auto select-none"
            style={{ height: 500, perspective: 1100, cursor: dragRef.current.dragging ? "grabbing" : "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
              {SERVICES.map((svc, i) => {
                const angle = (i / total) * 360 + rotY;
                const rad = (angle * Math.PI) / 180;
                const x = Math.sin(rad) * radius;
                const z = Math.cos(rad) * radius;
                const t = (z + radius) / (2 * radius);
                const scale = 0.66 + t * 0.42;
                const opacity = 0.54 + t * 0.46;
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
                      width: 190,
                      transition: "opacity 0.08s",
                    }}
                  >
                    <div
                      className="rounded-3xl border p-5 text-center transition-all duration-300"
                      style={{
                        background: isHov
                          ? `linear-gradient(135deg, ${svc.color}22, ${svc.color}11)`
                          : "rgba(8,17,32,0.92)",
                        backdropFilter: "blur(14px)",
                        boxShadow: isHov ? `0 0 32px ${svc.glow}` : "0 8px 32px rgba(0,0,0,0.5)",
                        border: isHov ? `1px solid ${svc.color}60` : "1px solid rgba(255,255,255,0.12)",
                        transform: isHov ? "translateY(-8px)" : "none",
                      }}
                    >
                      <div
                        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: `linear-gradient(135deg, ${svc.color}33, ${svc.color}11)`, boxShadow: `0 0 20px ${svc.glow}`, border: `1px solid ${svc.color}40` }}
                      >
                        <IconComp className="h-7 w-7" style={{ color: svc.color }} />
                      </div>
                      <h3 className="text-sm font-black text-white">{svc.name}</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-300">{svc.desc}</p>
                      <span className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-black" style={{ background: `${svc.color}20`, color: svc.color }}>
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
                width: 90,
                height: 90,
                background: "radial-gradient(circle, rgba(255,138,0,0.55), rgba(0,87,255,0.2), rgba(0,87,255,0))",
                boxShadow: "0 0 70px rgba(255,138,0,0.45)",
                filter: "blur(2px)",
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
