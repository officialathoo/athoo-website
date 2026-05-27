import { motion } from "framer-motion";
import { Link } from "wouter";

export default function ProviderTeaser() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="grid lg:grid-cols-2">
        
        {/* Left Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center bg-gradient-to-br from-[#FF8A00] to-orange-600 px-8 py-24 text-white lg:px-24"
        >
          <div className="mb-6 inline-table rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold w-max">
            For Professionals
          </div>
          
          <h2 className="mb-8 text-4xl font-black md:text-5xl lg:text-6xl">
            Join the Athoo Provider Waitlist
          </h2>
          
          <ul className="mb-12 space-y-4 text-lg font-medium text-white/90">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
              Future customer access
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
              Flexible work opportunities
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
              Easy Verification
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
              Professional Growth
            </li>
          </ul>

          <Link
            href="/become-provider"
            className="inline-flex w-max items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-[#FF8A00] transition-transform hover:scale-105"
          >
            Join Provider Waitlist
          </Link>
        </motion.div>

        {/* Right Side */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center gap-4 bg-gray-50 px-5 py-16 sm:gap-6 sm:px-8 sm:py-24 lg:px-24"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
              Future Earning Opportunity
            </div>
            <div className="text-4xl font-black leading-tight text-gray-900">
              Coming Soon
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="min-h-[145px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                Verified Providers
              </div>
              <div className="text-2xl font-black leading-tight break-words text-[#0057FF] sm:text-3xl">
                Verification
              </div>
            </div>
            
            <div className="min-h-[145px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:text-sm">
                App Launch
              </div>
              <div className="text-2xl font-black leading-tight break-words text-green-500 sm:text-3xl">
                Soon
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}