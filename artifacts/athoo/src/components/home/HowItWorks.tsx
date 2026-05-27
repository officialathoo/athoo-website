import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Grid3x3, Zap, FileCheck, ShieldCheck, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"customers" | "providers">("customers");

  const customerSteps = [
    { icon: Smartphone, color: "bg-blue-50 text-blue-600", title: "Open Athoo App", desc: "Join the waitlist and get notified when the Athoo app launches." },
    { icon: Grid3x3, color: "bg-orange-50 text-orange-600", title: "Choose Your Service", desc: "Explore 10+ planned service categories for everyday home needs." },
    { icon: Zap, color: "bg-green-50 text-green-600", title: "Get Connected Instantly", desc: "After launch, Athoo will help connect customers with verified local professionals." },
  ];

  const providerSteps = [
    { icon: FileCheck, color: "bg-blue-50 text-blue-600", title: "Register & Upload Docs", desc: "Sign up and provide your identification and skill proofs." },
    { icon: ShieldCheck, color: "bg-green-50 text-green-600", title: "Get Verified by Team", desc: "Our team reviews your profile to ensure trust and safety." },
    { icon: TrendingUp, color: "bg-orange-50 text-orange-600", title: "Receive Jobs & Earn", desc: "Get notified when provider onboarding opens and prepare to receive future job opportunities." },
  ];

  const currentSteps = activeTab === "customers" ? customerSteps : providerSteps;

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-8 text-4xl font-extrabold text-gray-900 md:text-5xl">How It Works</h2>
          
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("customers")}
              className={`rounded-full px-8 py-3 text-sm font-bold transition-all ${
                activeTab === "customers" ? "bg-[#0057FF] text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setActiveTab("providers")}
              className={`rounded-full px-8 py-3 text-sm font-bold transition-all ${
                activeTab === "providers" ? "bg-[#0057FF] text-white shadow-md" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Providers
            </button>
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Vertical dashed line */}
          <div className="absolute bottom-0 left-6 top-0 hidden w-0.5 border-l-2 border-dashed border-gray-200 md:block" />

          <div className="space-y-12">
            {currentSteps.map((step, i) => (
              <motion.div
                key={`${activeTab}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-start gap-6 md:flex-row md:items-center"
              >
                <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#081120] text-xl font-bold text-white shadow-lg">
                  {i + 1}
                </div>
                
                <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${step.color}`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-lg">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}