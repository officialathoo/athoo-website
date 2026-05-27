import { motion } from "framer-motion";
import { CheckCircle2, Mail, MapPin, ShieldCheck, Smartphone, Users } from "lucide-react";

const cards = [
  { icon: Smartphone, title: "Customer App", text: "Customers will be able to request home services, share job details, compare provider responses and track service progress after launch." },
  { icon: Users, title: "Provider App", text: "Skilled professionals will join a verified provider network, receive service requests and manage future earning opportunities through Athoo." },
  { icon: ShieldCheck, title: "Verification First", text: "Athoo is being built around identity checks, document review and service-category screening before provider activation." },
  { icon: MapPin, title: "Rawalpindi & Islamabad", text: "Initial launch planning is focused on Rawalpindi and Islamabad, with more cities to be added in phases after operational readiness." },
  { icon: CheckCircle2, title: "10+ Services", text: "Electrician, plumber, AC technician, carpenter, painter, cleaning, appliance repair, mason, welder and more service categories are planned." },
  { icon: Mail, title: "Direct Support", text: "For questions, partnerships or early access, contact official.athoo@gmail.com or WhatsApp +92 339 0051068." },
];

export default function CompleteInfoSection() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-[#0057FF]">Complete Athoo Overview</div>
          <h2 className="text-3xl font-black leading-tight text-gray-900 sm:text-5xl">What Athoo is building</h2>
          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">
            Athoo is a pre-launch home services platform for Pakistan. The website collects customer waitlist, provider interest and contact requests while the app, verification process and service operations are prepared.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="group rounded-[1.75rem] border border-white bg-white/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0057FF]/10 text-[#0057FF] transition group-hover:scale-105">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-gray-900">{card.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{card.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
