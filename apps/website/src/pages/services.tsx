import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Zap, Droplets, Wind, Hammer, PaintRoller, Sparkles, Tv, Home, BrickWall, Wrench, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { handleWaitlistClick } from "@/lib/navigation";
import { SiWhatsapp } from "react-icons/si";

const SERVICES = [
  {
    id: "electrician",
    name: "Electrician",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
    text: "text-blue-600",
    covers: ["Wiring and rewiring", "Electrical panel work", "Fixture installation", "Switch and socket repairs", "Fault finding and inspection", "Generator and UPS connections"],
    commonIssues: ["Power trips and breaker problems", "Flickering lights or dead sockets", "Overloaded circuits", "Faulty connections after construction"],
    athooHelp: "Athoo connects you with verified electricians who have undergone identity and experience checks — reducing the risk of substandard electrical work in your home.",
  },
  {
    id: "plumber",
    name: "Plumber",
    icon: Droplets,
    gradient: "from-cyan-500 to-sky-400",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    covers: ["Leak detection and repair", "Pipe replacement and installation", "Bathroom fitting and renovation", "Water motor and pump repair", "Water heater installation", "Drain unblocking"],
    commonIssues: ["Leaking pipes and fittings", "Low water pressure", "Blocked drains", "Broken water pumps before summer"],
    athooHelp: "Plumbing issues need urgent, reliable attention. Athoo's verified plumbers arrive as agreed and communicate clearly before starting any work.",
  },
  {
    id: "ac",
    name: "AC Repair & Maintenance",
    icon: Wind,
    gradient: "from-teal-500 to-emerald-400",
    bg: "bg-teal-50",
    text: "text-teal-700",
    covers: ["AC servicing and cleaning", "Gas refilling and topping", "Installation and uninstallation", "Fault diagnosis and repair", "Compressor service", "Filter and coil cleaning"],
    commonIssues: ["AC not cooling before summer", "Gas leak or gas running out", "Unusual noises", "Remote or thermostat faults"],
    athooHelp: "AC problems hit hardest in summer. Athoo helps you find available, verified AC technicians quickly — with clear pricing before work begins.",
  },
  {
    id: "carpenter",
    name: "Carpenter",
    icon: Hammer,
    gradient: "from-amber-500 to-orange-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    covers: ["Furniture repair and polishing", "Door fitting and repair", "Cabinet and wardrobe work", "False ceiling installation", "Custom woodwork", "Window and frame repair"],
    commonIssues: ["Damaged furniture needing repair", "Doors that won't close properly", "Cabinet hinges and handles", "Wood rot or damage after rain"],
    athooHelp: "Carpentry requires precision and experience. Athoo connects you with skilled carpenters whose past work and identity have been reviewed before they appear on the platform.",
  },
  {
    id: "painter",
    name: "Painter",
    icon: PaintRoller,
    gradient: "from-purple-500 to-pink-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
    covers: ["Interior wall painting", "Exterior and roof painting", "Wood and furniture painting", "Wall texture and finishing", "Waterproofing paint", "Commercial painting"],
    commonIssues: ["Peeling or faded paint after monsoon", "Wall patches needing uniform finishing", "New construction requiring full interior painting"],
    athooHelp: "Get clear painting quotes before work starts. Athoo providers share pricing and material details upfront — no surprise costs at the end of the job.",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: Sparkles,
    gradient: "from-green-500 to-lime-400",
    bg: "bg-green-50",
    text: "text-green-700",
    covers: ["Home deep cleaning", "Office and commercial cleaning", "Sofa and carpet cleaning", "Water tank cleaning", "Kitchen and bathroom deep clean", "Post-construction cleanup"],
    commonIssues: ["Seasonal deep cleaning before Eid", "Moving in/out cleaning", "Sofa or carpet staining", "Water tank bacterial build-up"],
    athooHelp: "Cleaning teams through Athoo arrive with the right equipment and products. Verified identity and feedback from previous customers means you know who is entering your home.",
  },
  {
    id: "appliance",
    name: "Appliance Repair",
    icon: Tv,
    gradient: "from-red-500 to-rose-400",
    bg: "bg-red-50",
    text: "text-red-600",
    covers: ["Refrigerator repair", "Washing machine repair", "Microwave and oven repair", "Dishwasher service", "Geyser and water heater repair", "TV and display troubleshooting"],
    commonIssues: ["Fridge not cooling", "Washing machine not draining", "Oven not heating", "Geyser failure in winter"],
    athooHelp: "Appliance repairs require both skill and the right spare parts. Athoo providers discuss part costs and quotes with you before any repair work begins.",
  },
  {
    id: "maintenance",
    name: "Home Maintenance",
    icon: Home,
    gradient: "from-indigo-500 to-blue-400",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    covers: ["General handyman tasks", "Fixture and fitting installation", "TV and shelf mounting", "Door lock and handle replacement", "Minor repairs and touch-ups", "Routine maintenance checks"],
    commonIssues: ["Miscellaneous home tasks that pile up", "TV mounting after moving in", "Broken door locks and handles", "General handyman needs"],
    athooHelp: "A trusted handyman is one of the hardest things to find reliably in Pakistan. Athoo's verified home maintenance providers are rated by previous customers so you can choose with confidence.",
  },
  {
    id: "mason",
    name: "Mason",
    icon: BrickWall,
    gradient: "from-stone-500 to-orange-300",
    bg: "bg-stone-50",
    text: "text-stone-700",
    covers: ["Tile installation and repair", "Cement and plaster work", "Wall and floor repair", "Small construction tasks", "Waterproofing applications", "Bathroom remodelling support"],
    commonIssues: ["Cracked tiles needing replacement", "Plaster peeling after rain", "Bathroom leaks requiring floor sealing", "Minor construction additions"],
    athooHelp: "Mason work affects the long-term integrity of your home. Athoo ensures providers have relevant experience before listing — and you see their feedback history before booking.",
  },
];

function ServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  const Icon = service.icon;
  return (
    <motion.article
      id={service.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${service.gradient} p-8 flex items-center gap-5`}>
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">{service.name}</h2>
          <span className="text-sm font-semibold text-white/80">Available at Launch</span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">What's Covered</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {service.covers.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${service.text}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-2xl ${service.bg} p-5`}>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
            <AlertCircle className={`h-4 w-4 ${service.text}`} />
            Common Issues
          </h3>
          <ul className="space-y-1">
            {service.commonIssues.map((issue) => (
              <li key={issue} className="text-sm text-gray-700">• {issue}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm text-gray-600 leading-relaxed">{service.athooHelp}</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={(e) => handleWaitlistClick(e)}
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${service.gradient} px-6 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all`}
          >
            Join Waitlist <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="https://wa.me/923390051068"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
          >
            <SiWhatsapp className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Athoo Services — Home Service Categories Launching in Rawalpindi & Islamabad</title>
        <meta
          name="description"
          content="Athoo is launching 10+ home service categories in Rawalpindi and Islamabad — electrician, plumber, AC repair, cleaning, carpentry, painting, appliance repair and more. All providers verified."
        />
        <link rel="canonical" href="https://athoo.pk/services" />
        <meta property="og:title" content="Athoo Services — Home Service Categories in Rawalpindi & Islamabad" />
        <meta property="og:description" content="Athoo is launching 10+ home service categories — electrician, plumber, AC repair, cleaning, carpentry, painting, appliance repair and more. All providers verified." />
        <meta property="og:url" content="https://athoo.pk/services" />
        <meta property="og:image" content="https://athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Athoo Services — Home Service Categories in Rawalpindi & Islamabad" />
        <meta name="twitter:description" content="Athoo is launching 10+ home service categories — electrician, plumber, AC repair, cleaning, carpentry, painting and more." />
        <meta name="twitter:image" content="https://athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://athoo.pk/services" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Athoo Home Services",
          "description": "Home service categories available through Athoo in Rawalpindi and Islamabad",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Electrician Services", "url": "https://athoo.pk/services#electrician" },
            { "@type": "ListItem", "position": 2, "name": "Plumber Services", "url": "https://athoo.pk/services#plumber" },
            { "@type": "ListItem", "position": 3, "name": "AC Repair & Service", "url": "https://athoo.pk/services#ac" },
            { "@type": "ListItem", "position": 4, "name": "House Cleaning", "url": "https://athoo.pk/services#cleaning" },
            { "@type": "ListItem", "position": 5, "name": "Carpentry", "url": "https://athoo.pk/services#carpentry" },
            { "@type": "ListItem", "position": 6, "name": "Painting", "url": "https://athoo.pk/services#painting" }
          ]
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-white overflow-hidden">

        {/* Hero */}
        <section className="relative px-6 py-20 text-center md:py-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(0,87,255,.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,138,0,.14),transparent_26%)]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl">
            <span className="inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-600 mb-5">
              Launching Soon in Rawalpindi & Islamabad
            </span>
            <h1 className="text-4xl font-black tracking-tight text-[#081120] sm:text-6xl mb-5">
              10+ Home Service Categories
            </h1>
            <p className="mx-auto max-w-3xl text-lg font-medium leading-8 text-slate-600 mb-8">
              Every provider on Athoo goes through a verification process before being listed. Clear pricing, structured communication, and a feedback system on both sides.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={(e) => handleWaitlistClick(e)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-colors"
              >
                Join Waitlist
              </button>
              <a
                href="/become-provider"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-8 py-4 font-bold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                Become a Provider
              </a>
            </div>
          </motion.div>
        </section>

        {/* Notes / Disclaimer Bar */}
        <section className="bg-amber-50 border-y border-amber-100 px-6 py-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center text-sm text-amber-800">
            <span className="font-bold flex-shrink-0">Important:</span>
            <span>Materials and spare parts may be charged separately where required and must be discussed with the provider and agreed by both parties before work begins. Service areas: Rawalpindi and Islamabad.</span>
          </div>
        </section>

        {/* Services Grid */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            {SERVICES.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}

            {/* More coming soon */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              className="bg-gradient-to-br from-[#081120] to-[#0057FF] rounded-3xl p-10 flex flex-col justify-center items-center text-center text-white"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-6">
                <Wrench className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black mb-4">More Categories Coming</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Athoo is preparing 10+ service categories and will expand based on customer demand and provider availability in Rawalpindi and Islamabad.
              </p>
              <button
                type="button"
                onClick={(e) => handleWaitlistClick(e)}
                className="rounded-full bg-[#FF8A00] px-8 py-4 font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Get Notified at Launch
              </button>
            </motion.div>
          </div>
        </section>

        {/* How it works CTA */}
        <section className="bg-gray-50 border-t border-gray-100 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-4">How the Booking Process Works</h2>
            <p className="text-lg text-gray-600 mb-8">
              Simple, structured, and transparent from start to finish.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                { step: "1", title: "Select a Service", desc: "Choose your service category and describe the issue." },
                { step: "2", title: "Provider Responds", desc: "Receive a response from a verified professional with pricing." },
                { step: "3", title: "Job Completed", desc: "Work is done, payment confirmed, and feedback shared." },
              ].map((s) => (
                <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0057FF] text-white font-black text-lg mb-4 mx-auto">{s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
            <a href="/how-it-works" className="inline-flex items-center gap-2 text-[#0057FF] font-bold hover:underline">
              Full Process Walkthrough <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

      </main>
    </>
  );
}
