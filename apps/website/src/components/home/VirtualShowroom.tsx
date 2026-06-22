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

function MobileProviderCard({ provider }: { provider: typeof PROVIDERS[0] }) {
  const IconComp = provider.icon;
  return (
    <div
      className="rounded-2xl border border-white/10 p-4 text-center"
      style={{ background: "rgba(8,17,32,0.8)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}40` }}
      >
        <IconComp className="h-6 w-6" style={{ color: provider.color }} />
      </div>
      <p className="text-sm font-black text-white">{provider.name}</p>
      <p className="text-xs text-slate-400">{provider.role}</p>
      <div className="mt-2 flex items-center justify-center gap-1">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="text-xs font-black text-amber-400">{provider.rating}</span>
      </div>
      <div className="mt-1 flex items-center justify-center gap-1">
        <ShieldCheck className="h-3 w-3 text-green-400" />
        <span className="text-xs font-bold text-green-400">Verified</span>
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
  const scale = 0.55 + ((z + radius) / (2 * radius)) * 0.65;
  const opacity = 0.45 + ((z + radius) / (2 * radius)) * 0.55;
  const IconComp = provider.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 160,
        transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
        zIndex: Math.round(scale * 100),
        opacity,
        transition: "opacity 0.1s",
      }}
    >
      <div
        className="rounded-2xl p-4 text-center transition-all duration-300"
        style={{
          background: hovered ? `linear-gradient(135deg, ${provider.color}30, rgba(8,17,32,0.95))` : "rgba(8,17,32,0.9)",
          backdropFilter: "blur(16px)",
          border: hovered ? `1px solid ${provider.color}60` : "1px solid rgba(255,255,255,0.08)",
          boxShadow: hovered ? `0 0 30px ${provider.color}40` : "0 4px 24px rgba(0,0,0,0.5)",
          transform: hovered ? "translateY(-6px)" : "none",
        }}
      >
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${provider.color}22`, border: `1px solid ${provider.color}40` }}
        >
          <IconComp className="h-6 w-6" style={{ color: provider.color }} />
        </div>
        <p className="text-sm font-black text-white">{provider.name}</p>
        <p className="text-xs text-slate-400">{provider.role}</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-400">{provider.rating}</span>
          <span className="text-xs text-slate-500">· {provider.jobs} jobs</span>
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
      if (!dragRef.current.dragging) setRotY((r) => r + 0.22);
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
    setRotY(dragRef.current.startRot + (e.clientX - dragRef.current.startX) * 0.35);
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
          <p className="mt-4 text-lg text-slate-400">
            {isMobile ? "Trusted professionals across Pakistan" : "Drag to explore the provider orbit"}
          </p>
        </div>

        {isMobile ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROVIDERS.map((p) => <MobileProviderCard key={p.name} provider={p} />)}
          </div>
        ) : (
          <div
            className="relative mx-auto select-none"
            style={{ height: 420, perspective: 900, cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {PROVIDERS.map((p, i) => (
              <ProviderNode
                key={p.name}
                provider={p}
                angle={(i / PROVIDERS.length) * 360}
                radius={320}
                rotY={rotY}
              />
            ))}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: 100, height: 100 }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(0,87,255,0.8) 0%, rgba(0,87,255,0) 70%)",
                  animation: "athoo-pulse 2.5s ease-in-out infinite",
                }}
              />
              <div
                className="absolute inset-3 rounded-full border-2 border-blue-500/50"
                style={{ animation: "athoo-spin 8s linear infinite" }}
              />
              <div className="absolute inset-6 flex items-center justify-center rounded-full bg-blue-600">
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
              <div className="mb-4 text-4xl font-black text-blue-500/30 transition-colors group-hover:text-blue-500/60">
                {step.num}
              </div>
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
