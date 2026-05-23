import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function AppShowcase() {
  const features = [
    "Book Any Service in Minutes",
    "Real-Time Provider Tracking",
    "Verified, Rated Professionals",
    "Secure & Transparent Process"
  ];

  return (
    <section id="app-showcase" className="athoo-navy overflow-hidden py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="mb-6 text-4xl font-extrabold text-white md:text-5xl">
                The Athoo App Experience
              </h2>
              <p className="text-xl leading-relaxed text-gray-400">
                Your entire home, managed from one place. Our upcoming app makes finding and booking trusted professionals effortless.
              </p>
            </div>

            <ul className="space-y-6">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-medium text-white">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex h-[600px] w-full items-center justify-center lg:justify-end"
          >
            {/* Glowing Orbs */}
            <div className="absolute top-1/2 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[80px]" />
            <div className="absolute top-1/2 right-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-orange-500/20 blur-[80px]" />

            {/* Phone 1: Customer */}
            <div className="absolute left-0 z-20 w-64 -rotate-6 transform rounded-[3rem] border-8 border-gray-800 bg-gray-900 shadow-2xl transition-transform hover:rotate-0 md:w-72 lg:left-12">
              <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-3xl bg-gray-800" />
              <div className="absolute -top-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-gray-900 shadow-xl">
                Customer App
              </div>
              <div className="h-[500px] w-full bg-gray-50 overflow-hidden flex flex-col rounded-b-3xl">
                <div className="bg-[#0057FF] p-6 pt-10 text-white">
                  <h3 className="font-bold text-lg">Book Service</h3>
                  <div className="mt-4 h-10 w-full rounded-lg bg-white/20" />
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-24 rounded-xl bg-white shadow-sm border border-gray-100 p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-50" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-3/4 bg-gray-200 rounded" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-24 rounded-xl bg-white shadow-sm border border-gray-100 p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-orange-50" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-3/4 bg-gray-200 rounded" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone 2: Provider */}
            <div className="absolute right-0 z-10 w-64 rotate-6 transform rounded-[3rem] border-8 border-gray-800 bg-gray-900 shadow-2xl transition-transform hover:rotate-0 md:w-72 lg:right-12">
              <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-3xl bg-gray-800" />
              <div className="absolute -top-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#FF8A00] px-4 py-1 text-xs font-bold text-white shadow-xl whitespace-nowrap">
                Provider App
              </div>
              <div className="h-[500px] w-full bg-gray-900 overflow-hidden flex flex-col rounded-b-3xl">
                <div className="p-6 pt-12 space-y-6">
                  <div className="bg-gray-800 rounded-2xl p-4 text-center">
                    <p className="text-gray-400 text-xs">New Request</p>
                    <p className="text-white font-bold text-xl mt-1">Electrical Repair</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 animate-pulse" />
                      <div>
                        <div className="h-3 w-20 bg-green-500/50 rounded mb-2" />
                        <div className="h-2 w-12 bg-green-500/30 rounded" />
                      </div>
                    </div>
                    <div className="mt-4 h-10 rounded-full bg-green-500 w-full opacity-80" />
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}