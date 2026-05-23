import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  const pillars = [
    { title: "Trust", desc: "Every professional is background-checked and skill-verified. We bring only the most reliable people into your home.", icon: Shield, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Speed", desc: "No more waiting for days. Our smart matching system connects you with the right professional in minutes.", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Growth", desc: "We empower local tradespeople with a digital platform to grow their business, manage bookings, and increase earnings.", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <>
      <Helmet>
        <title>About Athoo - Pakistan's Home Services Platform</title>
        <meta name="description" content="Learn about Athoo's mission to transform the home services industry in Pakistan." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen bg-white">
        {/* Hero */}
        <section className="athoo-navy py-24 md:py-32 text-white text-center px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6">Building Trust in Home Services</h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              We are on a mission to connect millions of Pakistanis with reliable, verified service professionals, bringing transparency to an unorganized industry.
            </p>
          </motion.div>
        </section>

        {/* Mission */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">The Problem We're Solving</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Finding a reliable electrician, plumber, or AC technician in Pakistan has traditionally been a hassle. It relies on word-of-mouth, unverified contacts, and unpredictable pricing. Customers face delays, safety concerns, and lack of accountability. On the other hand, skilled professionals struggle to find consistent work and grow their businesses beyond their immediate neighborhoods.
            </p>
            <div className="grid md:grid-cols-2 gap-8 pt-8">
              <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To empower local professionals by providing them with a digital platform to grow their business, while offering customers a safe, seamless, and reliable way to book home services.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-orange-50 border border-orange-100">
                <h3 className="text-2xl font-bold text-orange-600 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To become Pakistan's most trusted everyday app for all household needs, setting new standards for service quality, safety, and customer satisfaction across the country.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Pillars */}
        <section className="py-24 bg-gray-50 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-lg text-gray-500">The principles that guide everything we build.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
                >
                  <div className={`w-14 h-14 rounded-2xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-6`}>
                    <pillar.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Built for Pakistan</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              We understand the local context. From neighborhood dynamics to the specific challenges of load shedding and infrastructure, Athoo is designed specifically to address the unique needs of Pakistani households. We are building technology that works for our people.
            </p>
            <Link
              href="/#waitlist"
              className="inline-block bg-[#0057FF] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-blue-700 transition-colors shadow-xl shadow-blue-500/20"
            >
              Join the Waitlist
            </Link>
          </motion.div>
        </section>

      </div>
    </>
  );
}