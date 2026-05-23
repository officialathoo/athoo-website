import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldCheck, Star } from "lucide-react";
import athooLogo from "@assets/icon_1779544245383.png";

export default function HomeHero() {
  return (
    <section className="gradient-hero relative min-h-[100vh] overflow-hidden pt-20">
      {/* Blurred Orbs */}
      <div className="absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-[#0057FF] opacity-8 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-[#FF8A00] opacity-6 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500 opacity-3 blur-3xl mix-blend-multiply" />

      <div className="container mx-auto grid max-w-7xl gap-16 px-6 py-12 lg:grid-cols-2 lg:items-center lg:py-0 min-h-[calc(100vh-80px)]">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="flex flex-col items-start justify-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700"
          >
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Launching in Pakistan 2025
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold leading-none tracking-tight text-[#081120] md:text-7xl"
          >
            Pakistan's Smart <br />
            <span className="text-gradient-blue block py-2">Home Services</span>
            Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg text-xl leading-relaxed text-gray-500"
          >
            Find trusted professionals for everyday services — fast, reliable, and
            built for Pakistan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full flex-col gap-4 sm:flex-row"
          >
            <a
              href="#waitlist"
              className="glow-blue inline-flex items-center justify-center rounded-full bg-[#0057FF] px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30"
            >
              Join Waitlist
            </a>
            <Link
              href="/become-provider"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-transparent px-8 py-4 text-base font-bold text-gray-700 transition-all duration-200 hover:border-blue-500 hover:text-blue-600"
            >
              Become a Provider
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium text-gray-500"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              Verified Providers
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              Secure Payments
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-400" />
              5-Star Rated
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative hidden h-full w-full items-center justify-center lg:flex"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 to-transparent blur-3xl" />

          {/* Floating Card 1 */}
          <motion.div
            className="animate-float absolute -right-4 top-1/4 z-20 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-2xl"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Ahmed - Electrician</p>
              <p className="text-xs font-medium text-gray-500">⭐ 4.9 / 5.0</p>
            </div>
          </motion.div>

          {/* Floating Card 2 */}
          <motion.div
            className="animate-float-delayed absolute -left-12 bottom-1/3 z-20 w-48 rounded-2xl bg-white p-3 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔧</span>
              <span className="text-sm font-bold text-gray-900">Plumber</span>
            </div>
            <p className="text-xs font-medium text-blue-600 mb-2">Arriving in 12 min</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-3/4 rounded-full bg-blue-500" />
            </div>
          </motion.div>

          {/* Phone Frame */}
          <div className="relative z-10 mx-auto w-72 md:w-80 overflow-hidden rounded-[3rem] border-8 border-gray-900/90 bg-gray-900 shadow-2xl shadow-black/40">
            {/* Top Notch */}
            <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-3xl bg-gray-900/90" />
            
            {/* App UI */}
            <div className="relative h-[600px] w-full bg-gray-50 flex flex-col">
              {/* Header */}
              <div className="bg-white px-6 pb-6 pt-12 shadow-sm rounded-b-3xl">
                <img src={athooLogo} alt="Athoo Logo" className="mb-4 h-6 w-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Good morning!</h2>
                <p className="text-sm text-gray-500">What do you need help with?</p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-4 p-6">
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl">⚡</div>
                  <span className="text-xs font-medium text-gray-900">Electrician</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 text-xl">🚰</div>
                  <span className="text-xs font-medium text-gray-900">Plumber</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-xl">❄️</div>
                  <span className="text-xs font-medium text-gray-900">AC Service</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl">🔨</div>
                  <span className="text-xs font-medium text-gray-900">Carpenter</span>
                </div>
              </div>

              {/* Active Booking */}
              <div className="mt-auto p-6">
                <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg border border-gray-100">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                  <p className="text-xs font-bold text-orange-500 mb-1">UPCOMING</p>
                  <h3 className="text-sm font-bold text-gray-900">Electrician booked</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Ahmed R.</p>
                        <p className="text-[10px] text-gray-500">⭐ 4.9</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">10:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}