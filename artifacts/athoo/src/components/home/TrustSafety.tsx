import { motion } from "framer-motion";
import { ShieldCheck, Lock, Bell, Headphones, Receipt, MapPin } from "lucide-react";

export default function TrustSafety() {
  const features = [
    { title: "Verified Providers", desc: "Every provider is background-checked and skill-verified", icon: ShieldCheck, color: "bg-blue-50 text-blue-600" },
    { title: "Secure Platform", desc: "Your data and payments are fully protected", icon: Lock, color: "bg-orange-50 text-orange-600" },
    { title: "Real-Time Updates", desc: "Track your service provider in real time", icon: Bell, color: "bg-green-50 text-green-600" },
    { title: "24/7 Support", desc: "Our support team is always here to help", icon: Headphones, color: "bg-purple-50 text-purple-600" },
    { title: "Transparent Pricing", desc: "No hidden fees, no surprises", icon: Receipt, color: "bg-amber-50 text-amber-600" },
    { title: "Built for Pakistan", desc: "Designed specifically for Pakistani homes and culture", icon: MapPin, color: "bg-red-50 text-red-600" },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl">Trust & Safety First</h2>
          <p className="text-lg text-gray-500">
            We don't compromise on your security. Peace of mind from booking to completion.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group flex flex-col rounded-2xl border border-gray-100 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}