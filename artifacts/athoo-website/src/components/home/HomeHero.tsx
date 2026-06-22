import { useEffect, useState } from "react";
import { motion } from "@/lib/motionLite";
import { BellRing, ChevronRight, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { handlePathClick, handleWaitlistClick } from "@/lib/navigation";
import { apiUrl } from "@/lib/apiBase";
import Hero3DScene from "./Hero3DScene";

function HeroGalaxyBadge() {
  return (
    <div className="pointer-events-none absolute -right-2 -top-6 z-30 hidden h-32 w-32 sm:block lg:-right-10 lg:-top-10 lg:h-40 lg:w-40">
      <style>{`
        @keyframes heroGalaxySpin { to { transform: rotate(360deg); } }
        @keyframes heroGalaxyPulse { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.06); filter: brightness(1.2); } }
        .hero-galaxy-ring { animation: heroGalaxySpin 12s linear infinite; transform-origin:center; }
        .hero-galaxy-ring-alt { animation: heroGalaxySpin 16s linear infinite reverse; transform-origin:center; }
        .hero-galaxy-planet { animation: heroGalaxyPulse 4s ease-in-out infinite; }
      `}</style>
      <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl" />
      <div className="hero-galaxy-planet absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff,#3b82f6_34%,#0057FF_66%,#071537)] shadow-[0_0_50px_rgba(0,87,255,.55)] lg:h-24 lg:w-24" />
      <div className="hero-galaxy-ring absolute left-1/2 top-1/2 h-20 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-orange-300/45" />
      <div className="hero-galaxy-ring-alt absolute left-1/2 top-1/2 h-16 w-40 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[50%] border border-cyan-300/35" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-black text-white drop-shadow-lg">PK</div>
    </div>
  );
}

export default function HomeHero() {
  const [cms, setCms] = useState({
    badge: "App Launching Soon in Pakistan",
    title: "Pakistan's Smart Home Services App",
    highlight: "Launching Soon",
    subtitle: "Athoo is preparing to connect customers with trusted local service providers across Pakistan. Join the waitlist and get launch updates first.",
  });

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    fetch(apiUrl(`/api/public/cms?ts=${Date.now()}`), { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const c = data?.cms || {};
        setCms((prev) => ({
          badge: c.cms_hero_badge || c.cms_hero?.badge || prev.badge,
          title: c.cms_hero_title || c.cms_hero?.title || prev.title,
          highlight: c.cms_hero_highlight || "Launching Soon",
          subtitle: c.cms_hero_subtitle || c.cms_hero?.subtitle || prev.subtitle,
        }));
      })
      .catch(() => {})
      .finally(() => window.clearTimeout(timer));
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, []);

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#060d1c] pt-24">
      <Hero3DScene />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,87,255,0.22),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(255,138,0,0.18),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />

      <div className="container relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-7 text-center lg:text-left">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-black text-blue-300 shadow-lg shadow-blue-500/10 backdrop-blur lg:mx-0">
            <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" /></span>
            {cms.badge}
          </div>

          <h1 className="mx-auto max-w-5xl text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:mx-0 lg:text-7xl">
            {cms.title} <span className="bg-gradient-to-r from-[#0057FF] via-blue-400 to-[#FF8A00] bg-clip-text text-transparent">{cms.highlight}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-medium leading-8 text-slate-300 sm:text-xl lg:mx-0">
            {cms.subtitle}
          </p>

          <div className="grid gap-3 sm:flex sm:justify-center lg:justify-start">
            <a
              href="/#waitlist"
              onClick={(event) => handleWaitlistClick(event)}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#0057FF] px-7 py-4 text-base font-black text-white shadow-2xl transition hover:-translate-y-1 hover:bg-blue-500 pointer-events-auto touch-manipulation"
              style={{ boxShadow: "0 0 40px rgba(0,87,255,0.45)" }}
            >
              <BellRing className="h-5 w-5" /> Notify Me When Athoo Launches
            </a>
            <a
              href="/become-provider"
              onClick={(event) => handlePathClick("/become-provider", event)}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-base font-black text-white shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-orange-400/50 hover:text-[#FF8A00] pointer-events-auto touch-manipulation"
            >
              Become a Provider <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 text-left">
            {[
              ["10+", "Service Categories"],
              ["Verified", "Provider Network"],
              ["Pakistan", "Focused Platform"],
            ].map(([num, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
                <div className="text-xl font-black text-white sm:text-2xl">{num}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400 sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative mx-auto w-full max-w-[520px] pb-8 lg:pb-0">
          <HeroGalaxyBadge />
          <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-tr from-blue-600/40 to-orange-400/30 blur-3xl" />
          <div
            className="relative rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-2xl sm:p-5"
            style={{ boxShadow: "0 0 80px rgba(0,87,255,0.2), inset 0 0 40px rgba(0,87,255,0.05)" }}
          >
            <div className="absolute left-2 top-12 z-20 max-w-[240px] rounded-2xl border border-white/10 bg-black/60 p-3 shadow-2xl backdrop-blur sm:-left-8 sm:top-20">
              <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-400" /><span className="text-sm font-black text-white">Verified Providers</span></div>
            </div>
            <div className="absolute right-2 bottom-20 z-20 rounded-2xl border border-white/10 bg-black/60 p-3 shadow-2xl backdrop-blur sm:-right-8 sm:bottom-28">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#FF8A00]" /><span className="text-sm font-black text-white">Coming Soon</span></div>
            </div>
            <div className="mx-auto flex max-w-[310px] justify-center overflow-hidden rounded-[2rem] shadow-2xl sm:max-w-[360px]">
              <img
                src="/app-interface-clean-540.webp"
                srcSet="/app-interface-clean-360.webp 360w, /app-interface-clean-540.webp 540w, /app-interface-clean-720.webp 720w"
                sizes="(max-width: 640px) 310px, (max-width: 1024px) 360px, 360px"
                alt="Athoo app interface preview"
                width={540}
                height={1165}
                fetchPriority="high"
                decoding="async"
                className="app-preview-image h-auto w-full rounded-[1.6rem] object-contain"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-xl backdrop-blur">
              <Users className="mb-2 h-6 w-6 text-orange-300" />
              <p className="text-sm font-black">Customer + Provider Experience Preview</p>
            </div>
            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-4 text-white shadow-xl backdrop-blur">
              <MapPin className="mb-2 h-6 w-6 text-blue-400" />
              <p className="text-sm font-black">Built for Local Pakistani Services</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
