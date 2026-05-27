import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Clock, ShieldCheck, Banknote, Smartphone, Briefcase } from "lucide-react";
import ProviderInterestForm from "@/components/forms/ProviderInterestForm";

export default function BecomeProvider() {
  const benefits = [
    { title: "Consistent Income", desc: "Get notified when Athoo opens provider onboarding and future job opportunities.", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Flexible Schedule", desc: "Athoo is being designed to support flexible service opportunities after launch.", icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Zero Registration Fees", desc: "Joining the provider waitlist is free during pre-launch.", icon: Banknote, color: "text-green-500", bg: "bg-green-50" },
    { title: "Verified Customers", desc: "Athoo is planning a safer platform experience with provider and customer trust checks.", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Easy Payouts", desc: "Payment and payout features will be announced before launch.", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Smart App", desc: "The provider app experience is being prepared for launch.", icon: Smartphone, color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

  return (
    <>
      <Helmet>
        <title>Become an Athoo Provider — Provider Waitlist Opening Soon</title>
        <meta name="description" content="Join the Athoo provider waitlist. Provider onboarding is opening soon for skilled professionals in Pakistan." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen bg-white">
        
        {/* Hero */}
        <section className="athoo-navy py-24 px-6 text-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-table rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold w-max text-orange-400">
                For Professionals
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6">Join the Athoo Provider Waitlist</h1>
              <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-lg">
                Are you a skilled electrician, plumber, AC technician, carpenter or handyman? Provider onboarding is opening soon. Join the waitlist and our team will contact you.
              </p>
              
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">Soon</div>
                  <div className="text-sm text-gray-500">Onboarding</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-500 mb-1">Future</div>
                  <div className="text-sm text-gray-500">Opportunities</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">10+</div>
                  <div className="text-sm text-gray-500">Cities</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white text-gray-900 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Join Provider Waitlist</h3>
              <ProviderInterestForm />
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Partner with Us?</h2>
            <p className="text-lg text-gray-500">Join early and get notified when onboarding opens.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-6`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-orange-50 px-6">
          <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">Onboarding is Simple</h2>
             <div className="grid md:grid-cols-3 gap-8">
               <div className="relative">
                 <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">1</div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Apply Online</h3>
                 <p className="text-gray-600">Fill out the interest form with your details and service expertise.</p>
               </div>
               <div className="relative">
                 <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">2</div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Get Verified</h3>
                 <p className="text-gray-600">Our team will contact you to verify your identity and skills.</p>
               </div>
               <div className="relative">
                 <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">3</div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Launch Updates</h3>
                 <p className="text-gray-600">Get notified when the Athoo provider app and onboarding officially open.</p>
               </div>
             </div>
          </div>
        </section>

      </div>
    </>
  );
}