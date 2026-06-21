import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Shield, Zap, TrendingUp, Heart, Users, MapPin, CheckCircle2, Target, Eye,
  MessageSquare, Star, ArrowRight,
} from "lucide-react";
import { handleWaitlistClick } from "@/lib/navigation";

const CORE_VALUES = [
  { title: "Trust", desc: "Verification before listing. Every provider on Athoo is reviewed before appearing on the platform.", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Transparency", desc: "Clear pricing information, clear service descriptions, and clear expectations on both sides.", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
  { title: "Speed", desc: "Designed for fast, hassle-free connections between customers and nearby available professionals.", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
  { title: "Growth", desc: "Empowering skilled tradespeople with a digital platform to grow professionally beyond their neighbourhood.", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { title: "Accountability", desc: "Feedback and dispute processes that hold both customers and providers to fair standards.", icon: MessageSquare, color: "text-red-500", bg: "bg-red-50" },
  { title: "Community", desc: "Building a home services ecosystem that benefits households and local professionals across Pakistan.", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
];

const CUSTOMER_COMMITMENTS = [
  "Verified providers — no unscreened strangers entering your home",
  "Transparent pricing before any work begins",
  "Clear service descriptions for every category",
  "Structured complaints and dispute resolution",
  "Consistent feedback system to ensure quality",
  "Privacy protection for your personal and location data",
];

const PROVIDER_COMMITMENTS = [
  "A professional digital platform to grow your business",
  "Access to verified customers actively seeking services",
  "A fair reputation system that rewards quality work",
  "Support and guidance through the onboarding process",
  "Flexible work arrangements designed for independent professionals",
  "Zero registration fees during the pre-launch phase",
];

const PROBLEMS = [
  {
    title: "No Verification System",
    desc: "Anyone can call themselves a plumber or electrician. Customers have no way to confirm qualifications, identity, or past work history before hiring.",
    icon: Shield,
  },
  {
    title: "Inconsistent and Opaque Pricing",
    desc: "Quotes vary wildly for the same job. Without transparency, customers feel overcharged — and are often right.",
    icon: Star,
  },
  {
    title: "Unreliable Availability",
    desc: "Professionals agree to a time and don't show up, or arrive hours late. For urgent home issues, this causes real problems.",
    icon: Zap,
  },
  {
    title: "Limited Growth for Skilled Professionals",
    desc: "Talented electricians and plumbers are stuck in a small neighbourhood radius with no digital presence and no way to build a broader reputation.",
    icon: TrendingUp,
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Athoo — Building Trusted Home Services in Pakistan</title>
        <meta
          name="description"
          content="Learn about Athoo — Pakistan's upcoming home services platform connecting customers with verified professionals in Rawalpindi and Islamabad. Our mission, vision, and commitments."
        />
        <link rel="canonical" href="https://athoo.pk/about" />
        <meta property="og:title" content="About Athoo — Building Trusted Home Services in Pakistan" />
        <meta property="og:description" content="Learn about Athoo — Pakistan's upcoming home services platform connecting customers with verified professionals in Rawalpindi and Islamabad." />
        <meta property="og:url" content="https://athoo.pk/about" />
        <meta property="og:image" content="https://athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Athoo — Building Trusted Home Services in Pakistan" />
        <meta name="twitter:description" content="Learn about Athoo — Pakistan's upcoming home services platform connecting customers with verified professionals in Rawalpindi and Islamabad." />
        <meta name="twitter:image" content="https://athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "About Athoo", "item": "https://athoo.pk/about" }
          ]
        })}</script>
      </Helmet>

      <div className="flex flex-col min-h-screen bg-white">

        {/* Hero */}
        <section className="athoo-navy py-28 md:py-36 text-white text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-orange-400 mb-6">
              Our Story
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Building Trust in Pakistan's Home Services Market
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Athoo is an upcoming Pakistani home services platform designed to make access to trusted local professionals simpler, safer, and more reliable — starting in Rawalpindi and Islamabad.
            </p>
          </motion.div>
        </section>

        {/* Mission + Vision */}
        <section className="py-24 px-6 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="rounded-3xl bg-blue-50 border border-blue-100 p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-blue-700 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                To empower local home service professionals with a digital platform while giving customers in Rawalpindi and Islamabad a safer, simpler way to access verified, trusted services.
              </p>
            </div>
            <div className="rounded-3xl bg-orange-50 border border-orange-100 p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white mb-6">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-orange-600 mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                To become one of Pakistan's most trusted everyday platforms for household needs — setting clear, consistent standards for quality, safety, and customer experience across the country.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Why Athoo was created */}
        <section className="py-24 bg-gray-50 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-5">
                The Problem We Are Solving
              </h2>
              <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
                Finding a reliable electrician, plumber, or AC technician in Pakistan has traditionally been a hassle — relying on word-of-mouth, unverified contacts, and unpredictable pricing. Athoo is building a better way.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              {PROBLEMS.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-5">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-gray-500">
                The principles guiding everything we build.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {CORE_VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mb-6`}>
                    <v.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Focus */}
        <section className="py-24 bg-[#081120] text-white px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.25 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400 mb-6">
                  <MapPin className="h-7 w-7" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  Launching in Rawalpindi & Islamabad
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  Athoo's initial launch is focused on Rawalpindi and Islamabad — two connected cities with millions of households, a high demand for home services, and a shared frustration with the current informal market.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Starting focused allows us to build trust properly, ensure provider quality, and create a strong foundation before expanding to other cities across Pakistan.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                className="space-y-5"
              >
                {[
                  "10+ planned service categories at launch",
                  "Provider verification process for all listed professionals",
                  "Transparent pricing before booking confirmation",
                  "Structured feedback and accountability system",
                  "Expanding to more cities after establishing trust",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Commitments */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Our Commitments
              </h2>
              <p className="text-gray-500 text-lg">To both sides of the marketplace.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                className="rounded-3xl bg-blue-50 border border-blue-100 p-10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white mb-6">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black text-blue-700 mb-6">For Customers</h3>
                <ul className="space-y-4">
                  {CUSTOMER_COMMITMENTS.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl bg-orange-50 border border-orange-100 p-10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white mb-6">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black text-orange-600 mb-6">For Service Providers</h3>
                <ul className="space-y-4">
                  {PROVIDER_COMMITMENTS.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Future Growth */}
        <section className="py-24 bg-gray-50 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Built for Pakistan. Designed to Grow.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                We understand the local context — from neighbourhood dynamics to the specific challenges of infrastructure and load shedding. Athoo is being built for Pakistani households, by people who understand what local customers and tradespeople actually need.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-12">
                The Rawalpindi and Islamabad launch is step one. As trust is established and the platform matures, Athoo will expand to other major cities across Pakistan — always with the same commitment to quality, transparency, and accountability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={(e) => handleWaitlistClick(e)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0057FF] px-10 py-4 font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  Join Waitlist <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-10 py-4 font-bold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
