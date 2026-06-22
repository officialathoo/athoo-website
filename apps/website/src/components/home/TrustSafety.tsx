import { useEffect, useRef } from "react";
import { ShieldCheck, Lock, Bell, Headphones, Receipt, MapPin } from "lucide-react";

const FEATURES = [
  { title: "Verified Providers", desc: "Every provider is background-checked and skill-verified before joining.", icon: ShieldCheck, color: "#0057FF", from: "#0057FF", to: "#4facfe" },
  { title: "Secure Platform", desc: "Your data and payments are fully protected at every step.", icon: Lock, color: "#FF8A00", from: "#FF8A00", to: "#ffb347" },
  { title: "Real-Time Updates", desc: "Track your service provider live — from dispatch to completion.", icon: Bell, color: "#22c55e", from: "#22c55e", to: "#4ade80" },
  { title: "24/7 Support", desc: "Our dedicated support team is always here to help you.", icon: Headphones, color: "#a855f7", from: "#a855f7", to: "#c084fc" },
  { title: "Transparent Pricing", desc: "No hidden fees, no surprises — see the full price before booking.", icon: Receipt, color: "#f59e0b", from: "#f59e0b", to: "#fbbf24" },
  { title: "Built for Pakistan", desc: "Designed specifically for Pakistani homes, culture and lifestyle.", icon: MapPin, color: "#ef4444", from: "#ef4444", to: "#f87171" },
];

export default function TrustSafety() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-trust-card]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#060d1c] py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,87,255,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,138,0,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="athoo-reveal mb-16 text-center">
          <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-400">
            Trust & Safety
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Your Safety is Our{" "}
            <span className="bg-gradient-to-r from-[#0057FF] to-[#FF8A00] bg-clip-text text-transparent">
              Top Priority
            </span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg font-medium text-slate-400">
            We don't compromise on your security. Peace of mind — from the moment you book, to the moment the job is done.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const IconComp = feature.icon;
            return (
              <div
                key={feature.title}
                data-trust-card
                className="athoo-reveal-scale group relative overflow-hidden rounded-3xl p-7 transition-all duration-500"
                style={{
                  background: "rgba(8,17,32,0.75)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(14px)",
                  transitionDelay: `${i * 80}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${feature.color}40`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${feature.color}20`;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${feature.from}30, ${feature.to}15)`,
                    border: `1px solid ${feature.color}35`,
                  }}
                >
                  <IconComp className="h-7 w-7" style={{ color: feature.color }} />
                </div>

                <h3 className="mb-3 text-lg font-black text-white">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-400">{feature.desc}</p>

                <div
                  className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                />

                <div
                  className="absolute right-6 top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-30"
                  style={{ background: feature.color }}
                />
              </div>
            );
          })}
        </div>

        <div className="athoo-reveal mt-14 overflow-hidden rounded-3xl" style={{ transitionDelay: "400ms" }}>
          <div
            className="grid gap-0 md:grid-cols-3"
            style={{ background: "rgba(8,17,32,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { value: "100%", label: "Provider Verification Rate", color: "#22c55e" },
              { value: "10+", label: "Service Categories at Launch", color: "#0057FF" },
              { value: "PKR", label: "Local Currency & Pricing", color: "#FF8A00" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`p-8 text-center ${i < 2 ? "border-b border-white/7 md:border-b-0 md:border-r" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="mb-2 text-4xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.value}
                </div>
                <p className="text-sm font-bold text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
