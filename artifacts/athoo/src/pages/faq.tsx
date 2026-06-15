import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ChevronDown, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const FAQS = [
  {
    category: "About Athoo",
    questions: [
      {
        q: "What is Athoo?",
        a: "Athoo is an upcoming Pakistani home services platform designed to connect customers with verified local service professionals. It covers 10+ categories including plumbing, electrical, AC repair, cleaning, carpentry, painting, appliance repair, and general home maintenance — starting in Rawalpindi and Islamabad.",
      },
      {
        q: "Where is Athoo launching?",
        a: "Athoo is launching in Rawalpindi and Islamabad, Pakistan. These two cities are the initial focus. Expansion to other cities will follow based on demand and provider availability.",
      },
      {
        q: "Is the Athoo app live?",
        a: "The Athoo app is not yet publicly available. We are in pre-launch phase. You can join the waitlist on our website to be notified as soon as the app launches. Provider onboarding is also opening soon.",
      },
      {
        q: "Is Athoo free to use?",
        a: "Joining the waitlist is completely free. Details about service fees, subscription tiers, and platform charges will be announced before launch.",
      },
    ],
  },
  {
    category: "For Customers",
    questions: [
      {
        q: "How can customers join Athoo?",
        a: "You can join the customer waitlist by entering your email on the Athoo website. You will receive launch updates, early access information, and service availability news directly to your inbox.",
      },
      {
        q: "How does booking a service work?",
        a: "Once the app is live, customers will be able to select a service category, describe their issue, set a preferred time and location, and receive responses from available verified professionals in their area. The process is designed to be fast and straightforward.",
      },
      {
        q: "Are materials and spare parts included in the service price?",
        a: "In general, materials and spare parts are not included in the base service fee unless explicitly stated. Providers should discuss any materials costs with the customer before beginning work, and both parties should agree on costs upfront.",
      },
      {
        q: "What if I have a problem with a completed service?",
        a: "Athoo will have a structured complaints and dispute process after launch. During pre-launch, you can reach our support team at support@athoo.pk or via WhatsApp at +92 339 0051068.",
      },
      {
        q: "Which services will be available at launch?",
        a: "Planned services at launch include: Plumbing, Electrical, AC Repair & Maintenance, Cleaning, Carpentry, Painting, Appliance Repair, Home Maintenance, and Masonry. More categories will be added based on demand.",
      },
    ],
  },
  {
    category: "For Service Providers",
    questions: [
      {
        q: "How can service professionals join Athoo?",
        a: "Service providers can register their interest through the Become a Provider page on the Athoo website. Fill in your name, service category, city, experience, and contact details. Our team will contact you when provider onboarding opens.",
      },
      {
        q: "Are providers verified before joining?",
        a: "Yes. Athoo's approach is that all providers go through a verification process before they are listed on the platform. This includes identity confirmation, service category review, experience check, and agreement to Athoo's professional conduct standards.",
      },
      {
        q: "Is there a fee to register as a provider?",
        a: "Joining the provider waitlist is free. Detailed information about platform fees and commission structure will be communicated to registered providers before the full launch.",
      },
      {
        q: "Which service categories can providers register for?",
        a: "Currently accepting registrations for: Electricians, Plumbers, AC Technicians, Cleaners, Carpenters, Painters, Appliance Repair Technicians, General Handymen, and Masons. More categories will be added.",
      },
      {
        q: "What documents are required for provider verification?",
        a: "During the verification process, providers will be asked for basic identity information, details about their trade experience, and service category confirmation. Full documentation requirements will be communicated during the onboarding process.",
      },
    ],
  },
  {
    category: "Pricing & Payments",
    questions: [
      {
        q: "How does pricing work on Athoo?",
        a: "Athoo is designed around transparent pricing. Service rates will be clearly communicated before a booking is confirmed. Providers will share quotes based on the job description, and customers will see pricing details before agreeing to proceed.",
      },
      {
        q: "Are prices fixed or negotiable?",
        a: "Pricing details will be confirmed before the app launches. The goal is to ensure both customers and providers have clarity on pricing before any work begins.",
      },
      {
        q: "What payment methods will Athoo support?",
        a: "Payment methods, including cash, bank transfer, and digital wallet options, will be announced before launch. Payment details will be clearly communicated within the app.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        q: "How do I contact Athoo support?",
        a: "You can reach us by email at support@athoo.pk for general support, info@athoo.pk for general inquiries, or official@athoo.pk for business matters. You can also contact us on WhatsApp at +92 339 0051068.",
      },
      {
        q: "What are Athoo's social media channels?",
        a: "You can follow Athoo on Instagram (@athoo_services), Facebook (Athoo.Services), TikTok (@athoo.pk), and LinkedIn (Athoo company page). Links are in the footer of this website.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 group-hover:text-[#0057FF] transition-colors">{q}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-[#0057FF]" : ""}`}
        />
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

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>FAQ — Frequently Asked Questions | Athoo</title>
        <meta
          name="description"
          content="Answers to common questions about Athoo — Pakistan's upcoming home services platform. Learn about how Athoo works for customers and providers in Rawalpindi and Islamabad."
        />
        <link rel="canonical" href="https://athoo.pk/faq" />
        <meta property="og:title" content="FAQ — Frequently Asked Questions | Athoo" />
        <meta property="og:description" content="Answers to common questions about Athoo — Pakistan's upcoming home services platform for Rawalpindi and Islamabad." />
        <meta property="og:url" content="https://athoo.pk/faq" />
        <meta property="og:image" content="https://athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ — Frequently Asked Questions | Athoo" />
        <meta name="twitter:description" content="Answers to common questions about Athoo — Pakistan's upcoming home services platform." />
        <meta name="twitter:image" content="https://athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://athoo.pk/faq" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.flatMap((cat) =>
            cat.questions.map((item) => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": { "@type": "Answer", "text": item.a },
            }))
          ),
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="athoo-navy py-24 px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black mb-6">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-400">
              Everything you need to know about Athoo — for customers and service providers.
            </p>
          </motion.div>
        </section>

        {/* FAQ Sections */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="space-y-16">
            {FAQS.map((section, i) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="text-xl font-black text-[#0057FF] mb-6 pb-3 border-b-2 border-blue-50">
                  {section.category}
                </h2>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-6">
                  {section.questions.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Still have questions */}
        <section className="bg-gray-50 border-t border-gray-100 px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-6">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-8">
              Our team is happy to help. Reach out via email or WhatsApp and we'll get back to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@athoo.pk"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0057FF] px-8 py-4 font-bold text-[#0057FF] hover:bg-blue-50 transition-colors"
              >
                Email Support
              </a>
              <a
                href="https://wa.me/923390051068"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 font-bold text-white hover:bg-green-600 transition-colors"
              >
                <SiWhatsapp className="h-5 w-5" />
                WhatsApp Us
              </a>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              Or visit our{" "}
              <Link href="/contact" className="text-[#0057FF] hover:underline">
                Contact page
              </Link>{" "}
              for all contact options.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
