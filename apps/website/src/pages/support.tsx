import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  HelpCircle, UserPlus, AlertTriangle, CreditCard, Smartphone,
  MessageSquareWarning, BookOpen, Mail, ArrowRight,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import ContactForm from "@/components/forms/ContactForm";

const SUPPORT_TOPICS = [
  {
    icon: HelpCircle,
    title: "Booking Help",
    desc: "Questions about scheduling, modifying, or canceling a service request. How the booking process works after launch.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: UserPlus,
    title: "Provider Registration",
    desc: "Assistance with joining Athoo as a service professional — how to register, what documents are needed, and what happens next.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: AlertTriangle,
    title: "Service Issue",
    desc: "Report a problem with a completed or ongoing service. We take all service complaints seriously and will respond promptly.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: CreditCard,
    title: "Payment Questions",
    desc: "Help with invoices, pricing estimates, material cost queries, and questions about how payments will work on the platform.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Smartphone,
    title: "App & Website Support",
    desc: "Technical issues with the website, your account, form submissions, or the upcoming mobile app.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: MessageSquareWarning,
    title: "Complaint Escalation",
    desc: "Urgent matters regarding safety, trust violations, or major disputes. We take these seriously and prioritise escalated complaints.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: BookOpen,
    title: "Waitlist & Launch Info",
    desc: "Questions about the customer or provider waitlist, when Athoo is launching, and how to stay updated.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: Mail,
    title: "Newsletter & Updates",
    desc: "Managing your subscription to Athoo launch updates and news — including opting out or changing your email preferences.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

const QUICK_FAQS = [
  {
    q: "Is the Athoo app currently available?",
    a: "No — Athoo is in pre-launch phase. The app is not yet publicly available. You can join the waitlist to receive launch notifications.",
  },
  {
    q: "How do I register as a service provider?",
    a: "Visit our Become a Provider page and fill in the registration form. Our team will contact you when provider onboarding opens.",
  },
  {
    q: "Which service areas does Athoo cover?",
    a: "Athoo is launching in Rawalpindi and Islamabad, Pakistan. Other cities will follow based on demand and provider availability.",
  },
  {
    q: "How quickly will I receive a response?",
    a: "During pre-launch, email responses typically take 1–2 business days. For urgent matters, use WhatsApp for a faster reply.",
  },
];

export default function SupportPage() {
  return (
    <>
      <Helmet>
        <title>Support — Athoo Help Centre</title>
        <meta
          name="description"
          content="Get help from the Athoo support team. Customer support, provider registration help, booking assistance, complaints, and technical issues — we're here to help."
        />
        <link rel="canonical" href="https://www.athoo.pk/support" />
        <meta property="og:title" content="Support — Athoo Help Centre" />
        <meta property="og:description" content="Get help from the Athoo support team. Customer support, provider help, booking assistance, complaints, and technical issues." />
        <meta property="og:url" content="https://www.athoo.pk/support" />
        <meta property="og:image" content="https://www.athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Support — Athoo Help Centre" />
        <meta name="twitter:description" content="Get help from the Athoo support team — customer support, provider help, and technical assistance." />
        <meta name="twitter:image" content="https://www.athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "Support", "item": "https://www.athoo.pk/support" }
          ]
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="athoo-navy py-24 px-6 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-5">How Can We Help?</h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Our support team is here to assist with any question about Athoo — for customers, service providers, and business partners.
            </p>
          </motion.div>
        </section>

        {/* Quick contact */}
        <section className="bg-gray-50 border-b border-gray-100 px-6 py-8">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:support@athoo.pk"
              className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-[#0057FF] transition-colors">Email Support</p>
                <p className="text-sm text-blue-600">support@athoo.pk</p>
              </div>
            </a>
            <a
              href="https://wa.me/923390051068"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-green-200 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 flex-shrink-0">
                <SiWhatsapp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">WhatsApp</p>
                <p className="text-sm text-green-600">+92 339 0051068</p>
              </div>
            </a>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-black text-gray-900 mb-10 text-center">Support Topics</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_TOPICS.map((topic, i) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${topic.bg} ${topic.color} mb-5`}>
                  <topic.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{topic.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick FAQ */}
        <section className="bg-gray-50 border-y border-gray-100 px-6 py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Quick Answers</h2>
            <div className="space-y-4">
              {QUICK_FAQS.map((item) => (
                <div key={item.q} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/faq" className="inline-flex items-center gap-2 text-[#0057FF] font-bold hover:underline">
                View All FAQs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-3">Send a Support Request</h2>
            <p className="text-gray-600">Describe your issue and we'll respond as soon as possible.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12">
            <ContactForm />
          </div>
        </section>

        {/* Provider Support CTA */}
        <section className="bg-[#081120] px-6 py-16 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black mb-4">Are You a Service Provider?</h2>
            <p className="text-gray-400 mb-8">
              For provider registration support, onboarding questions, or professional inquiries — visit our provider page or email us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/become-provider" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8A00] px-8 py-4 font-bold text-white hover:bg-orange-600 transition-colors">
                Provider Page
              </Link>
              <a href="mailto:official@athoo.pk" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 font-bold text-white hover:bg-white/10 transition-colors">
                official@athoo.pk
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
