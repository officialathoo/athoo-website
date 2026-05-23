import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck, BellRing } from "lucide-react";

export default function AppShowcase() {
  const features = [
    "Customer and provider preview experience",
    "Launch-only preview — no live booking yet",
    "Verified provider flow planned",
    "10+ service categories coming soon",
  ];

  return (
    <section id="app-showcase" className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(0,87,255,.13),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(255,138,0,.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#eef5ff_45%,#ffffff_100%)] py-16 sm:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,87,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,87,255,.045)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="space-y-7 text-center lg:text-left"
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-sm font-black text-blue-700 shadow-lg shadow-blue-500/10 backdrop-blur lg:mx-0">
              <Sparkles className="h-4 w-4 text-[#FF8A00]" />
              App Preview — Launching Soon
            </div>

            <div>
              <h2 className="mb-5 text-4xl font-black leading-tight tracking-[-0.04em] text-[#081120] sm:text-5xl lg:text-6xl">
                The Athoo App Experience
              </h2>
              <p className="mx-auto max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-xl lg:mx-0">
                Athoo is still in pre-launch. This clean mobile preview shows the experience we are preparing for customers and service providers in Pakistan.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {features.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="flex items-center gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 text-left shadow-xl shadow-blue-950/5 backdrop-blur"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-base font-black text-[#081120]">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative min-h-[620px] w-full sm:min-h-[700px]"
          >
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500/20 via-white to-orange-400/20 blur-3xl" />

            <motion.div
              animate={{ y: [0, -12, 0], rotate: [-6, -4, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 top-24 w-[205px] rotate-[-8deg] rounded-[2.1rem] border border-white/80 bg-white p-2 shadow-2xl shadow-blue-950/15 sm:top-12 sm:w-[250px] sm:p-3 lg:left-4"
            >
              <img src="/app-interface-clean-sm.webp" alt="Athoo customer app preview" width="420" height="906" loading="lazy" decoding="async" className="app-preview-image h-auto w-full rounded-[1.6rem]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0], rotate: [5, 7, 5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 top-0 w-[245px] rotate-[5deg] rounded-[2.4rem] border border-white/90 bg-white p-2 shadow-2xl shadow-blue-950/20 sm:right-8 sm:w-[340px] sm:p-3 lg:right-4"
            >
              <img src="/app-interface-clean.webp" alt="Athoo provider app preview" width="720" height="1553" loading="lazy" decoding="async" className="app-preview-image h-auto w-full rounded-[1.8rem]" />
              <div className="absolute -left-4 top-16 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#081120] shadow-xl ring-1 ring-slate-100 sm:-left-8">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-500" /> Verified Providers</div>
              </div>
              <div className="absolute -right-2 bottom-16 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#081120] shadow-xl ring-1 ring-slate-100 sm:-right-7">
                <div className="flex items-center gap-2"><BellRing className="h-5 w-5 text-[#FF8A00]" /> Launching Soon</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="absolute bottom-0 left-1/2 w-[94%] max-w-xl -translate-x-1/2 rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-xl sm:p-5"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-blue-50 p-3"><div className="text-xl font-black text-[#0057FF]">10+</div><div className="text-xs font-bold text-slate-500">Categories</div></div>
                <div className="rounded-2xl bg-orange-50 p-3"><div className="text-xl font-black text-[#FF8A00]">Soon</div><div className="text-xs font-bold text-slate-500">App Launch</div></div>
                <div className="rounded-2xl bg-green-50 p-3"><div className="text-xl font-black text-green-600">Safe</div><div className="text-xs font-bold text-slate-500">Preview</div></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
