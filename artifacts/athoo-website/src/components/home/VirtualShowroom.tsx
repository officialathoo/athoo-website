import { useEffect, useMemo, useRef, useState } from "react";
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
  { num: "02", title: "Matched to Providers", desc: "Athoo connects you with trusted professionals near you." },
  { num: "03", title: "Confirm & Book", desc: "Chat, compare, and confirm. Your slot is locked." },
  { num: "04", title: "Job Done. Review.", desc: "Rate your provider. Build the trust network." },
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

function MobileProviderCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, startX: 0 });
  const total = PROVIDERS.length;

  const next = () => setActiveIndex((i) => (i + 1) % total);
  const prev = () => setActiveIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (isDragging) return;
    const timer = window.setInterval(next, 3800);
    return () => window.clearInterval(timer);
  }, [isDragging, total]);

  const visible = useMemo(() => [-1, 0, 1].map((offset) => {
    const index = (activeIndex + offset + total) % total;
    return { item: PROVIDERS[index], offset };
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
        <div className="pointer-events-none absolute inset-x-6 top-12 h-44 rounded-full bg-blue-500/10 blur-3xl" />
        {visible.map(({ item, offset }) => {
          const IconComp = item.icon;
          const isCenter = offset === 0;
          const x = offset * 128 + dragOffset;
          return (
            <article
              key={`${item.name}-${offset}`}
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
                boxShadow: isCenter ? `0 22px 60px ${item.color}35` : "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: `${item.color}24`, border: `1px solid ${item.color}45` }}
              >
                <IconComp className="h-7 w-7" style={{ color: item.color }} />
              </div>
              <p className="text-base font-black text-white">{item.name}</p>
              <p className="mt-1 min-h-[36px] text-xs font-semibold leading-5 text-slate-300">{item.role}</p>
              <div className="mt-3 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-amber-300">{item.rating}</span>
                <span className="text-xs text-slate-400">· {item.jobs} jobs</span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-xs font-bold text-green-400">Verified</span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-1 flex justify-center gap-2">
        {PROVIDERS.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-label={`Show ${item.name}`}
            onClick={() => setActiveIndex(index)}
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: activeIndex === index ? 22 : 9,
              background: activeIndex === index ? "#0057FF" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProviderNode({ provider, angle, radius, rotY }: { provider: typeof PROVIDERS[0]; angle: number; radius: number; rotY: number }) {
  const [hovered, setHovered] = useState(false);
  const totalAngle = angle + rotY;
  const rad = (totalAngle * Math.PI) / 180;
  const x = Math.sin(rad) * radius;
  const z = Math.cos(rad) * radius;
  const t = (z + radius) / (2 * radius);
  const scale = 0.62 + t * 0.5;
  const opacity = 0.55 + t * 0.45;
  const IconComp = provider.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "absolute", left: "50%", top: "50%", width: 160, transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`, zIndex: Math.round(scale * 100), opacity, transition: "opacity 0.08s" }}
    >
      <div
        className="rounded-2xl p-4 text-center transition-all duration-300"
        style={{
          background: hovered ? `linear-gradient(135deg, ${provider.color}30, rgba(8,17,32,0.95))` : "rgba(8,17,32,0.92)",
          backdropFilter: "blur(16px)",
          border: hovered ? `1px solid ${provider.color}60` : "1px solid rgba(255,255,255,0.12)",
          boxShadow: hovered ? `0 0 30px ${provider.color}40` : "0 4px 24px rgba(0,0,0,0.5)",
          transform: hovered ? "translateY(-6px)" : "none",
        }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}40` }}>
          <IconComp className="h-6 w-6" style={{ color: provider.color }} />
        </div>
        <p className="text-sm font-black text-white">{provider.name}</p>
        <p className="text-xs text-slate-300">{provider.role}</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-400">{provider.rating}</span>
          <span className="text-xs text-slate-400">· {provider.jobs} jobs</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3 text-green-400" />
          <span className="text-xs font-bold text-green-400">Verified</span>
        </div>
      </div>
    </div>
  );
}

export default function VirtualShowroom() {
  const [rotY, setRotY] = useState(0);
  const isMobile = useIsMobile();
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isMobile) return;
    const tick = () => {
      if (!dragRef.current.dragging) setRotY((r) => r + 0.12);
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
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * 0.28);
  };
  const onPointerUp = () => { dragRef.current.dragging = false; };

  return (
    <section className="relative overflow-hidden bg-[#030812] py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,87,255,0.15),transparent)]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-400">
            Provider Network
          </span>
          <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">
            Meet Athoo's{" "}
            <span className="bg-gradient-to-r from-[#0057FF] to-[#4facfe] bg-clip-text text-transparent">
              Verified Experts
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Trusted service professionals being prepared for Athoo's launch network.
          </p>
        </div>

        {isMobile ? (
          <MobileProviderCarousel />
        ) : (
          <div
            className="relative mx-auto select-none"
            style={{ height: 420, perspective: 900, cursor: dragRef.current.dragging ? "grabbing" : "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {PROVIDERS.map((p, i) => (
              <ProviderNode key={p.name} provider={p} angle={(i / PROVIDERS.length) * 360} radius={300} rotY={rotY} />
            ))}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 100, height: 100 }}>
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,87,255,0.8) 0%, rgba(0,87,255,0) 70%)", animation: "athoo-pulse 2.5s ease-in-out infinite" }} />
              <div className="absolute inset-3 rounded-full border-2 border-blue-500/50" style={{ animation: "athoo-spin 8s linear infinite" }} />
              <div className="absolute inset-6 flex items-center justify-center rounded-full bg-blue-600"><MapPin className="h-5 w-5 text-white" /></div>
            </div>
          </div>
        )}

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="athoo-reveal group relative overflow-hidden rounded-3xl border border-white/8 p-6" style={{ background: "linear-gradient(135deg, rgba(0,87,255,0.08), rgba(8,17,32,0.9))", transitionDelay: `${i * 80}ms` }}>
              <div className="mb-4 text-4xl font-black text-blue-500/30 transition-colors group-hover:text-blue-500/60">{step.num}</div>
              <h3 className="mb-2 text-base font-black text-white">{step.title}</h3>
              <p className="text-sm leading-6 text-slate-400">{step.desc}</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#0057FF] to-[#FF8A00] transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
