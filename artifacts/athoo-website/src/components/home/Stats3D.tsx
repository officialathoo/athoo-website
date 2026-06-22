import { useEffect, useRef, useState } from "react";
import { BellRing, ShieldCheck, Wrench, MapPin } from "lucide-react";

const STATS = [
  { value: "Soon", label: "App Launch", icon: BellRing, color: "#FF8A00", from: "#FF8A00", to: "#ff6b00" },
  { value: "10+", label: "Service Categories", icon: Wrench, color: "#0057FF", from: "#0057FF", to: "#4facfe" },
  { value: "100%", label: "Verified Network", icon: ShieldCheck, color: "#22c55e", from: "#22c55e", to: "#4ade80" },
  { value: "PK", label: "Pakistan Focused", icon: MapPin, color: "#a855f7", from: "#a855f7", to: "#c084fc" },
];

export default function Stats3D() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#080f1e] py-20"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,87,255,0.1),transparent_60%)]" />

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat, i) => {
            const IconComp = stat.icon;
            return (
              <div
                key={stat.label}
                className="stat-glass-card group relative overflow-hidden rounded-3xl p-6 text-center transition-all duration-500"
                style={{
                  background: "rgba(8,17,32,0.85)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.92)",
                  opacity: visible ? 1 : 0,
                  transitionDelay: `${i * 100}ms`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = `0 0 40px ${stat.color}30`;
                  el.style.borderColor = `${stat.color}40`;
                  el.style.transform = "translateY(-6px) scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = "none";
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                  el.style.transform = "translateY(0) scale(1)";
                }}
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.from}30, ${stat.to}15)`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <IconComp className="h-7 w-7" style={{ color: stat.color }} />
                </div>
                <div
                  className="text-3xl font-black sm:text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.from}, ${stat.to})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <p className="mt-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
