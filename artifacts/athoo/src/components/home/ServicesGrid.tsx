import { motion } from "framer-motion";
import { Link } from "wouter";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home, BrickWall, Wrench } from "lucide-react";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Electrical repairs, wiring and fixtures", icon: Zap, color: "from-blue-500 to-cyan-400" },
  { id: "plumber", name: "Plumber", desc: "Leaks, pipes and bathroom fittings", icon: Droplets, color: "from-cyan-500 to-sky-400" },
  { id: "ac", name: "AC Service", desc: "AC maintenance, installation and repair", icon: Wind, color: "from-teal-500 to-emerald-400" },
  { id: "carpenter", name: "Carpenter", desc: "Furniture, doors and wood work", icon: Hammer, color: "from-amber-500 to-orange-400" },
  { id: "painter", name: "Painter", desc: "Interior and exterior painting", icon: PaintRoller, color: "from-purple-500 to-pink-400" },
  { id: "cleaning", name: "Cleaning", desc: "Home and office deep cleaning", icon: Sparkles, color: "from-green-500 to-lime-400" },
  { id: "appliance", name: "Appliance Repair", desc: "Fridge, washer, microwave and more", icon: Tv, color: "from-red-500 to-rose-400" },
  { id: "maintenance", name: "Home Maintenance", desc: "Routine handyman support", icon: Home, color: "from-indigo-500 to-blue-400" },
  { id: "mason", name: "Mason", desc: "Small construction and repair work", icon: BrickWall, color: "from-stone-500 to-orange-300" },
  { id: "more", name: "More Coming Soon", desc: "10+ service categories planned", icon: Wrench, color: "from-[#0057FF] to-[#FF8A00]" },
];

export default function ServicesGrid() {
  return (
    <section className="relative overflow-hidden bg-[#f7fbff] py-20 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent" />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-600">10+ Categories Coming Soon</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-[#081120] sm:text-5xl">Home Services Planned for Athoo</h2>
          <p className="mt-4 text-lg font-medium leading-8 text-slate-600">Athoo is preparing a trusted service network for everyday home needs across Pakistan.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((service, index) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.04 }}>
              <Link href={`/services#${service.id}`} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-blue-950/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-600/15">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-black text-[#081120]">{service.name}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{service.desc}</p>
                  <span className="mt-5 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">Launching Soon</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
