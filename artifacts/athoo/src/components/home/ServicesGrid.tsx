import { motion } from "framer-motion";
import { Link } from "wouter";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Wiring, fixtures, and electrical repairs", icon: Zap, color: "bg-blue-50 text-blue-600" },
  { id: "plumber", name: "Plumber", desc: "Pipes, leaks, and plumbing fixes", icon: Droplets, color: "bg-cyan-50 text-cyan-600" },
  { id: "ac", name: "AC Service", desc: "AC installation, service & repair", icon: Wind, color: "bg-teal-50 text-teal-600" },
  { id: "carpenter", name: "Carpenter", desc: "Furniture, doors, and wood work", icon: Hammer, color: "bg-amber-50 text-amber-600" },
  { id: "painter", name: "Painter", desc: "Interior & exterior painting", icon: PaintRoller, color: "bg-purple-50 text-purple-600" },
  { id: "cleaning", name: "Cleaning", desc: "Deep cleaning & sanitization", icon: Sparkles, color: "bg-green-50 text-green-600" },
  { id: "appliance", name: "Appliance Repair", desc: "All home appliance repairs", icon: Tv, color: "bg-red-50 text-red-600" },
  { id: "maintenance", name: "Home Maintenance", desc: "All-in-one home care", icon: Home, color: "bg-indigo-50 text-indigo-600" },
];

export default function ServicesGrid() {
  return (
    <section className="bg-[#f9fafb] py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl">Services We Offer</h2>
          <p className="text-lg text-gray-500">
            Professional help for every corner of your home, just a tap away.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/services#${service.id}`}>
                <div className="group flex h-full cursor-pointer flex-col rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:brightness-110 ${service.color}`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{service.desc}</p>
                  <div className="mt-auto pt-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-sm font-medium text-blue-600">Learn More →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}