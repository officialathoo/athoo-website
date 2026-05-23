import { motion } from "framer-motion";
import { Link } from "wouter";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Wiring, repairs, and installations", icon: Zap },
  { id: "plumber", name: "Plumber", desc: "Leaks, pipes, and bathroom fittings", icon: Droplets },
  { id: "ac", name: "AC Service", desc: "Installation, gas filling, and repair", icon: Wind },
  { id: "carpenter", name: "Carpenter", desc: "Furniture repair and assembly", icon: Hammer },
  { id: "painter", name: "Painter", desc: "Interior and exterior wall painting", icon: PaintRoller },
  { id: "cleaning", name: "Cleaning", desc: "Deep cleaning for home and office", icon: Sparkles },
  { id: "appliance", name: "Appliance Repair", desc: "Fridge, washing machine, oven", icon: Tv },
  { id: "maintenance", name: "Home Maintenance", desc: "General handyman services", icon: Home },
];

export default function ServicesGrid() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Services</h2>
            <p className="text-lg text-muted-foreground">
              Whatever you need done around the house, we have a verified professional ready to help.
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/services#${service.id}`}>
                <div className="group h-full p-6 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
           <Button variant="outline" asChild className="w-full">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}