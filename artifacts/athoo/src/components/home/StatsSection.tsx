import { motion } from "framer-motion";
import { BellRing, ShieldCheck, Wrench, MapPin } from "lucide-react";

export default function StatsSection() {
  const stats = [
    { value: "Soon", label: "App Launch", icon: BellRing, color: "bg-orange-500" },
    { value: "10+", label: "Service Categories", icon: Wrench, color: "bg-blue-500" },
    { value: "Verified", label: "Provider Network", icon: ShieldCheck, color: "bg-green-500" },
    { value: "Pakistan", label: "Focused Platform", icon: MapPin, color: "bg-purple-500" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#081120] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-center backdrop-blur sm:p-7">
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} text-white shadow-lg`}><stat.icon className="h-6 w-6" /></div>
              <div className="text-2xl font-black text-white sm:text-4xl">{stat.value}</div>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide text-gray-400 sm:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
