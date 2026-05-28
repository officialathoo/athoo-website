import { motion } from "framer-motion";
import { BellRing, ChevronRight, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { goToPath, goToWaitlist } from "@/lib/navigation";

export default function HomeHero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(0,87,255,.16),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(255,138,0,.20),transparent_24%),linear-gradient(135deg,#ffffff_0%,#eef5ff_52%,#fff4e6_100%)] pt-24">
      <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-[#0057FF]/20 blur-3xl" />
      <div className="absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-[#FF8A00]/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />

      <div className="container relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-7 text-center lg:text-left">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-black text-blue-700 shadow-lg shadow-blue-500/10 backdrop-blur lg:mx-0">
            <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" /></span>
            App Launching Soon in Pakistan
          </div>

          <h1 className="mx-auto max-w-5xl text-4xl font-black leading-[0.98] tracking-[-0.04em] text-[#081120] sm:text-6xl lg:mx-0 lg:text-7xl">
            Pakistan’s Smart Home Services App <span className="bg-gradient-to-r from-[#0057FF] via-blue-500 to-[#FF8A00] bg-clip-text text-transparent">Launching Soon</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl lg:mx-0">
            Athoo is preparing to connect customers with trusted local service providers across Pakistan. Join the waitlist and get launch updates first.
          </p>

          <div className="grid gap-3 sm:flex sm:justify-center lg:justify-start">
            <button type="button" onClick={goToWaitlist} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#0057FF] px-7 py-4 text-base font-black text-white shadow-2xl shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-blue-700 pointer-events-auto touch-manipulation">
              <BellRing className="h-5 w-5" /> Notify Me When Athoo Launches
            </button>
            <button type="button" onClick={() => goToPath("/become-provider")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-7 py-4 text-base font-black text-slate-900 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-orange-300 hover:text-[#FF8A00] pointer-events-auto touch-manipulation">
              Become a Provider <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 text-left">
            {[
              ["10+", "Service Categories"],
              ["Verified", "Provider Network"],
              ["Pakistan", "Focused Platform"],
            ].map(([num, label]) => (
              <div key={label} className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-xl shadow-blue-950/5 backdrop-blur">
                <div className="text-xl font-black text-[#081120] sm:text-2xl">{num}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative mx-auto w-full max-w-[520px] pb-8 lg:pb-0">
          <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-tr from-blue-600/30 to-orange-400/30 blur-3xl" />
          <div className="relative rounded-[2.5rem] border border-white/70 bg-white/80 p-3 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl sm:p-5">
            <div className="absolute left-2 top-12 z-20 max-w-[240px] rounded-2xl bg-white/95 p-3 shadow-2xl sm:-left-8 sm:top-20">
              <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-500" /><span className="text-sm font-black">Verified Providers</span></div>
            </div>
            <div className="absolute right-2 bottom-20 z-20 rounded-2xl bg-white/95 p-3 shadow-2xl sm:-right-8 sm:bottom-28">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#FF8A00]" /><span className="text-sm font-black">Coming Soon</span></div>
            </div>
            <div className="mx-auto flex max-w-[310px] justify-center overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:max-w-[360px]">
              <img src="/app-interface-clean.png" alt="Athoo app interface preview" className="app-preview-image h-auto w-full rounded-[1.6rem] object-contain" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-[#081120] p-4 text-white shadow-xl"><Users className="mb-2 h-6 w-6 text-orange-300" /><p className="text-sm font-black">Customer + Provider Experience Preview</p></div>
            <div className="rounded-3xl bg-white p-4 text-[#081120] shadow-xl"><MapPin className="mb-2 h-6 w-6 text-blue-600" /><p className="text-sm font-black">Built for Local Pakistani Services</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
