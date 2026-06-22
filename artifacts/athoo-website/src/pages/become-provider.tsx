import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motionLite";
import {
  CheckCircle2, TrendingUp, Clock, ShieldCheck, Banknote, Smartphone,
  Briefcase, Star, Users, FileText, ChevronDown,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import ProviderInterestForm from "@/components/forms/ProviderInterestForm";

const BENEFITS = [
  { title: "Consistent Work", desc: "Get notified when Athoo opens provider onboarding and access a growing base of verified customers actively seeking your services.", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Flexible Schedule", desc: "Athoo is designed to support flexible, independent work. You decide when you are available — no mandatory shifts or schedules.", icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
  { title: "Free to Join", desc: "Joining the provider waitlist is completely free during pre-launch. Full fee and commission details will be shared before onboarding opens.", icon: Banknote, color: "text-green-500", bg: "bg-green-50" },
  { title: "Verified Platform", desc: "Athoo verifies both customers and providers. Your customers know who you are — and you know your customers are genuine.", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50" },
  { title: "Build Your Reputation", desc: "A feedback and rating system lets you build a professional reputation over time — rewarding quality work with more job opportunities.", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  { title: "Smart App", desc: "The provider app experience is being built for ease of use — manage jobs, communicate with customers, and track your earnings in one place.", icon: Smartphone, color: "text-cyan-500", bg: "bg-cyan-50" },
  { title: "Professional Profile", desc: "Your Athoo profile serves as a digital presence that shows your verified services, experience, and customer feedback to potential clients.", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
  { title: "Earn More", desc: "Access customers you would never reach through word-of-mouth alone. A larger customer pool means more opportunities and more consistent income.", icon: Briefcase, color: "text-rose-500", bg: "bg-rose-50" },
];

const CATEGORIES = [
  "Electrician", "Plumber", "AC Technician", "Cleaning Professional",
  "Carpenter", "Painter", "Appliance Repair Technician", "General Handyman / Maintenance",
  "Mason", "Other (specify in form)",
];

const PROCESS_STEPS = [
  {
    step: "1",
    title: "Register Your Interest",
    desc: "Fill out the provider interest form on this page with your name, service category, city, and experience. Takes 2 minutes.",
  },
  {
    step: "2",
    title: "Our Team Contacts You",
    desc: "When provider onboarding opens, our team will reach out to verify your identity, experience, and service area.",
  },
  {
    step: "3",
    title: "Complete Verification",
    desc: "Submit basic identity documents and service category details. The verification process is straightforward and professional.",
  },
  {
    step: "4",
    title: "Profile Setup",
    desc: "Set up your professional provider profile with your service details, availability, and coverage area.",
  },
  {
    step: "5",
    title: "Start Receiving Jobs",
    desc: "Once the app is live, receive relevant service requests from customers in your area and grow your business.",
  },
];

const PROVIDER_FAQS = [
  {
    q: "Is there a fee to register as a provider?",
    a: "Joining the provider waitlist is completely free. Detailed information about platform fees, commission rates, and any subscription plans will be communicated to registered providers before the full launch.",
  },
  {
    q: "What documents are required for verification?",
    a: "During verification, you will be asked for basic identity information (CNIC or equivalent), your service category and years of experience, and your preferred working area. Full document requirements will be communicated during onboarding.",
  },
  {
    q: "What services can I register for?",
    a: "Athoo is accepting registrations for electricians, plumbers, AC technicians, cleaning professionals, carpenters, painters, appliance repair technicians, general handymen, and masons. More categories will be added based on demand.",
  },
  {
    q: "Can I register for multiple service categories?",
    a: "Yes. If you offer services in more than one category (for example, electrical and general maintenance), you can indicate this in your registration form.",
  },
  {
    q: "How will I receive job requests?",
    a: "Once the app is live, you will receive job requests through the Athoo provider app based on your location, service category, and availability. You can accept or decline requests based on your schedule.",
  },
  {
    q: "Will Athoo set my prices?",
    a: "No. Providers set their own pricing for jobs. Athoo provides a framework for transparent pricing and requires that costs — including materials and spare parts — are communicated and agreed with customers before work begins.",
  },
  {
    q: "What cities does Athoo cover?",
    a: "Athoo is launching in Rawalpindi and Islamabad. Providers from these cities should register now. Expansion to other cities will happen based on demand.",
  },
  {
    q: "What if I have a dispute with a customer?",
    a: "Athoo will have a structured dispute resolution process after launch. Our support team will assist in facilitating fair resolution. You can also reach us at official@athoo.pk or via WhatsApp at +92 339 0051068.",
  },
];

function ProviderFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="font-semibold text-gray-900 group-hover:text-[#FF8A00] transition-colors">{q}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-[#FF8A00]" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BecomeProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldScroll = window.location.hash === "#provider-form" || window.location.search.includes("cta=provider");
    if (!shouldScroll) return;
    window.setTimeout(() => {
      document.getElementById("provider-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

  return (
    <>
      <Helmet>
        <title>Become an Athoo Provider — Join Pakistan's Home Services Platform</title>
        <meta name="description" content="Join Athoo as a verified service provider in Rawalpindi and Islamabad. Register your interest as an electrician, plumber, AC technician, carpenter, or other home service professional." />
        <link rel="canonical" href="https://www.athoo.pk/become-provider" />
        <meta property="og:title" content="Become an Athoo Provider — Join Pakistan's Home Services Platform" />
        <meta property="og:description" content="Join Athoo as a verified service provider in Rawalpindi and Islamabad. Register as an electrician, plumber, AC technician, carpenter, or other home service professional." />
        <meta property="og:url" content="https://www.athoo.pk/become-provider" />
        <meta property="og:image" content="https://www.athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Become an Athoo Provider — Join Pakistan's Home Services Platform" />
        <meta name="twitter:description" content="Register as a verified home service provider on Athoo — electrician, plumber, AC technician, carpenter and more." />
        <meta name="twitter:image" content="https://www.athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "Become a Provider", "item": "https://www.athoo.pk/become-provider" }
          ]
        })}</script>
      </Helmet>

      <div className="flex flex-col min-h-screen bg-white">

        {/* Hero */}
        <section className="athoo-navy py-24 px-6 text-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-orange-400">
                For Service Professionals
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Join the Athoo Provider Waitlist
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Are you a skilled electrician, plumber, AC technician, carpenter, painter, or handyman? Athoo is building Pakistan's trusted home services platform — and we're looking for verified professionals to join.
              </p>
              <p className="text-gray-500 leading-relaxed mb-10">
                Provider onboarding is opening soon. Register your interest now and our team will contact you with full details when onboarding begins.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-2xl font-black text-white mb-1">Soon</div>
                  <div className="text-xs text-gray-500">Onboarding Opens</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-orange-400 mb-1">Free</div>
                  <div className="text-xs text-gray-500">To Register</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white mb-1">10+</div>
                  <div className="text-xs text-gray-500">Categories</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              id="provider-form"
              className="bg-white text-gray-900 rounded-3xl p-8 shadow-2xl scroll-mt-28"
            >
              <h3 className="text-2xl font-black mb-2">Register Your Interest</h3>
              <p className="text-sm text-gray-500 mb-6">No fees. No commitments. We'll contact you when onboarding opens.</p>
              <ProviderInterestForm />
            </motion.div>
          </div>
        </section>

        {/* Who Can Register */}
        <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Who Can Register?</h2>
              <p className="text-gray-500 text-lg">Skilled professionals across these service categories are welcome.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-[#FF8A00] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Join Athoo?</h2>
              <p className="text-lg text-gray-500">A professional platform built for skilled Pakistani tradespeople.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white border border-gray-100 p-7 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-5`}>
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How the Process Works */}
        <section className="py-24 bg-[#081120] text-white px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">How Provider Onboarding Works</h2>
              <p className="text-gray-400 text-lg">A simple, professional process designed to get you started quickly.</p>
            </div>
            <div className="space-y-6">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FF8A00] text-white font-black text-lg shadow-lg shadow-orange-500/20">
                    {step.step}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl p-5">
                    <h3 className="font-black text-lg mb-1">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="py-20 px-6 bg-orange-50 border-y border-orange-100">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white mb-6">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">What You'll Need for Verification</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Athoo verifies all providers before they are listed on the platform. The process is professional, straightforward, and designed to protect both you and your customers.
              </p>
              <ul className="space-y-3">
                {[
                  "Valid identity document (CNIC)",
                  "Service category and trade details",
                  "Years of experience in your field",
                  "Preferred working area (city/sector)",
                  "Contact number for our team",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-orange-100 shadow-sm p-7">
              <h3 className="font-black text-gray-900 mb-4">Professional Conduct Expected</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                All Athoo providers agree to a set of professional conduct standards before being listed. This includes:
              </p>
              <ul className="space-y-2">
                {[
                  "Arriving on time and communicating delays",
                  "Providing clear quotes before work starts",
                  "Discussing materials costs with customers upfront",
                  "Treating customers and their property with respect",
                  "Completing agreed work to a professional standard",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Provider FAQ */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Provider Questions</h2>
              <p className="text-gray-500">Common questions from professionals about joining Athoo.</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7">
              {PROVIDER_FAQS.map((item) => (
                <ProviderFAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#FF8A00] to-orange-600 px-6 py-20 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">Ready to Join Athoo?</h2>
            <p className="text-white/80 mb-8 text-lg">
              Register your interest now. Our team will contact you as soon as provider onboarding opens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#provider-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-orange-600 hover:bg-orange-50 transition-colors shadow-xl"
              >
                Register Now
              </a>
              <a
                href="https://wa.me/923390051068"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/50 px-8 py-4 font-bold text-white hover:bg-white/10 transition-colors"
              >
                <SiWhatsapp className="h-5 w-5" />
                Ask on WhatsApp
              </a>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Questions? Email us at{" "}
              <a href="mailto:official@athoo.pk" className="underline text-white hover:text-white/80">
                official@athoo.pk
              </a>
            </p>
          </div>
        </section>

      </div>
    </>
  );
}
