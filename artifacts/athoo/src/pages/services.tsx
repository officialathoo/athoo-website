import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home, BrickWall, Wrench } from "lucide-react";
import { Link } from "wouter";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Electrical wiring, fixture installation, repair support and inspection services planned for homes and businesses.", icon: Zap, color: "from-blue-500 to-cyan-400" },
  { id: "plumber", name: "Plumber", desc: "Leak repairs, pipe work, bathroom fittings, water motor support and plumbing maintenance planned.", icon: Droplets, color: "from-cyan-500 to-sky-400" },
  { id: "ac", name: "AC Service", desc: "AC maintenance, gas filling, installation and repair support planned for Pakistani summers.", icon: Wind, color: "from-teal-500 to-emerald-400" },
  { id: "carpenter", name: "Carpenter", desc: "Furniture repair, door work, fittings, polishing and custom wood work categories planned.", icon: Hammer, color: "from-amber-500 to-orange-400" },
  { id: "painter", name: "Painter", desc: "Interior and exterior painting support with professional finishing and transparent process planned.", icon: PaintRoller, color: "from-purple-500 to-pink-400" },
  { id: "cleaning", name: "Cleaning", desc: "Home, office, sofa, water tank and deep cleaning service categories planned for launch phases.", icon: Sparkles, color: "from-green-500 to-lime-400" },
  { id: "appliance", name: "Appliance Repair", desc: "Support for fridge, washing machine, microwave and other appliance repair categories planned.", icon: Tv, color: "from-red-500 to-rose-400" },
  { id: "maintenance", name: "Home Maintenance", desc: "General handyman, installation and routine home maintenance support categories planned.", icon: Home, color: "from-indigo-500 to-blue-400" },
  { id: "mason", name: "Mason", desc: "Small construction, tile, wall, cement and repair service categories planned.", icon: BrickWall, color: "from-stone-500 to-orange-300" },
  { id: "more", name: "More Coming Soon", desc: "Athoo is preparing 10+ service categories and will expand based on customer and provider demand.", icon: Wrench, color: "from-[#0057FF] to-[#FF8A00]" },
];

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Athoo Services — 10+ Home Service Categories Coming Soon</title>
        <meta name="description" content="Athoo is launching soon with 10+ planned home service categories in Pakistan including electrician, plumber, AC service, cleaning and more." />
      </Helmet>
      <main className="overflow-hidden bg-white pt-24">
        <section className="relative px-4 py-16 text-center sm:px-6 md:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(0,87,255,.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,138,0,.16),transparent_26%)]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-600">Launching Soon</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#081120] sm:text-6xl">10+ Service Categories Coming Soon</h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg font-medium leading-8 text-slate-600">Athoo is preparing a modern home services platform for Pakistan. These categories are planned for launch and future expansion.</p>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <motion.article key={service.id} id={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.04 }} className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-blue-950/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/10 sm:p-8">
                <div className="absolute right-5 top-5 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">Coming Soon</div>
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg`}><service.icon className="h-8 w-8" /></div>
                <h2 className="text-2xl font-black text-[#081120]">{service.name}</h2>
                <p className="mt-3 text-base font-medium leading-7 text-slate-600">{service.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="bg-[#081120] px-4 py-16 text-white sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">Be first to know when Athoo launches</h2>
            <p className="mt-4 text-lg text-blue-100">Join the waitlist for launch updates, service announcements and provider onboarding news.</p>
            <Link href="/#waitlist" className="mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#FF8A00] px-8 py-4 font-black text-white shadow-xl shadow-orange-500/25">Join Waitlist</Link>
          </div>
        </section>
      </main>
    </>
  );
}
