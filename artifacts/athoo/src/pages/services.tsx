import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home } from "lucide-react";
import { Link } from "wouter";

const SERVICES = [
  { id: "electrician", name: "Electrician", desc: "Professional electrical wiring, repairs, and installations for residential and commercial properties. We handle everything from short circuits to complete wiring.", icon: Zap, color: "bg-blue-50 text-blue-600" },
  { id: "plumber", name: "Plumber", desc: "Expert plumbing services for leak repairs, pipe installations, water motor issues, and bathroom fittings. Fast response for emergencies.", icon: Droplets, color: "bg-cyan-50 text-cyan-600" },
  { id: "ac", name: "AC Service", desc: "Comprehensive AC maintenance, gas filling, installation, and repair to keep you cool during summer. Servicing all major brands.", icon: Wind, color: "bg-teal-50 text-teal-600" },
  { id: "carpenter", name: "Carpenter", desc: "Custom furniture making, door lock repairs, polishing, and general assembly by skilled woodworkers.", icon: Hammer, color: "bg-amber-50 text-amber-600" },
  { id: "painter", name: "Painter", desc: "High-quality interior and exterior painting services. From touch-ups to complete home transformations with premium finishes.", icon: PaintRoller, color: "bg-purple-50 text-purple-600" },
  { id: "cleaning", name: "Cleaning", desc: "Thorough deep cleaning services for homes, offices, water tanks, and sofas. Leaving your spaces spotless and sanitized.", icon: Sparkles, color: "bg-green-50 text-green-600" },
  { id: "appliance", name: "Appliance Repair", desc: "Reliable repair services for fridges, washing machines, microwaves, and other home appliances right at your doorstep.", icon: Tv, color: "bg-red-50 text-red-600" },
  { id: "maintenance", name: "Home Maintenance", desc: "General handyman services, picture hanging, curtain rod installation, and routine maintenance to keep your home in top shape.", icon: Home, color: "bg-indigo-50 text-indigo-600" },
];

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Home Services in Pakistan - Athoo</title>
        <meta name="description" content="Explore Athoo's full range of home services in Pakistan including electricians, plumbers, AC repair, and cleaning services." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen bg-white">
        {/* Hero */}
        <section className="gradient-hero py-24 md:py-32 px-6 text-center border-b border-gray-100">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Our Services</h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              From quick fixes to major repairs, Athoo connects you with verified professionals for all your home service needs in Pakistan.
            </p>
          </motion.div>
        </section>

        {/* Grid */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-6 right-6 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </div>
                <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h2>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-24 bg-gray-50 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Trusted Home Services in Pakistan</h2>
            <p className="text-gray-600">
              Athoo is building the premier local service marketplace. Whether you are looking for an <strong>electrician in Pakistan</strong>, a reliable <strong>plumber</strong>, or expert <strong>AC repair</strong>, our platform ensures quality home services. We take the hassle out of home maintenance by bringing vetted, background-checked professionals directly to your doorstep.
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Book Services Through Athoo?</h3>
            <p className="text-gray-600">
              We understand that your home is your sanctuary. Inviting a stranger into your home for repairs requires trust. That is why every service provider on Athoo undergoes a rigorous verification process. Our transparent pricing means no haggling, and our customer support ensures that your job is completed to your satisfaction.
            </p>
            <div className="mt-12 text-center">
               <Link
                href="/#waitlist"
                className="inline-block bg-[#0057FF] text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-colors"
              >
                Join the Waitlist Today
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}