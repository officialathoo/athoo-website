import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function AppShowcase() {
  const features = [
    "Customer and provider app preview",
    "Launch-only preview, not live booking yet",
    "Verified provider flow planned",
    "10+ service categories coming soon"
  ];

  return (
    <section id="app-showcase" className="athoo-navy overflow-hidden py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="space-y-7">
            <div>
              <h2 className="mb-5 text-3xl font-extrabold leading-tight text-white sm:text-5xl">The Athoo App Experience</h2>
              <p className="text-base leading-8 text-gray-300 sm:text-xl">
                Athoo is still in pre-launch. This clean mobile preview shows the experience we are preparing for customers and providers in Pakistan.
              </p>
            </div>
            <ul className="space-y-5">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400"><CheckCircle2 className="h-5 w-5" /></div>
                  <span className="text-base font-semibold text-white sm:text-lg">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative flex min-h-[560px] w-full items-center justify-center sm:min-h-[650px]">
            <div className="absolute h-72 w-72 rounded-full bg-blue-500/20 blur-[90px]" />
            <div className="absolute right-4 top-10 h-64 w-64 rounded-full bg-orange-500/20 blur-[90px]" />
            <div className="relative w-[300px] rounded-[2.2rem] bg-white/10 p-3 shadow-2xl ring-1 ring-white/15 backdrop-blur sm:w-[360px]">
              <img src="/app-interface.png" alt="Athoo app mobile preview" className="w-full rounded-[1.7rem] object-contain shadow-2xl" />
              <div className="absolute -left-3 top-20 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#081120] shadow-xl sm:-left-8">Verified Providers</div>
              <div className="absolute -right-3 bottom-24 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#081120] shadow-xl sm:-right-8">Coming Soon</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
