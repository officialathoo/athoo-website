import { Helmet } from "react-helmet-async";
import { motion } from "@/lib/motionLite";
import { Mail, Phone, MapPin, Clock, HelpCircle, ArrowRight } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { Link } from "wouter";
import ContactForm from "@/components/forms/ContactForm";

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "General Inquiries",
    value: "info@athoo.pk",
    href: "mailto:info@athoo.pk",
    desc: "For general questions about Athoo",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Mail,
    title: "Customer Support",
    value: "support@athoo.pk",
    href: "mailto:support@athoo.pk",
    desc: "For help with bookings, accounts, and service issues",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Mail,
    title: "Business & Official",
    value: "official@athoo.pk",
    href: "mailto:official@athoo.pk",
    desc: "For partnerships, media, and official matters",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Phone,
    title: "Phone & WhatsApp",
    value: "+92 339 0051068",
    href: "tel:+923390051068",
    desc: "Available during business hours (PKT)",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const SUPPORT_TOPICS = [
  "Joining the customer waitlist",
  "Provider registration and onboarding",
  "Service area and launch timeline questions",
  "Business partnerships and media inquiries",
  "Technical issues with the website",
  "Complaints and dispute escalation",
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Athoo — Get in Touch | Rawalpindi & Islamabad</title>
        <meta
          name="description"
          content="Contact Athoo for general inquiries, customer support, provider registration help, or business partnerships. Email us at info@athoo.pk or message on WhatsApp."
        />
        <link rel="canonical" href="https://www.athoo.pk/contact" />
        <meta property="og:title" content="Contact Athoo — Get in Touch | Rawalpindi & Islamabad" />
        <meta property="og:description" content="Contact Athoo for general inquiries, customer support, provider registration help, or business partnerships. Email info@athoo.pk or WhatsApp us." />
        <meta property="og:url" content="https://www.athoo.pk/contact" />
        <meta property="og:image" content="https://www.athoo.pk/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Athoo — Get in Touch" />
        <meta name="twitter:description" content="Contact Athoo for inquiries, support, or provider help. Email info@athoo.pk or WhatsApp us." />
        <meta name="twitter:image" content="https://www.athoo.pk/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.athoo.pk/" },
            { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://www.athoo.pk/contact" }
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
            <h1 className="text-4xl md:text-6xl font-black mb-5">Get in Touch</h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Whether you're a customer, a service professional, or have a business inquiry — we're here to help. Reach out and we'll respond as quickly as possible.
            </p>
          </motion.div>
        </section>

        {/* Contact Cards */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {CONTACT_CHANNELS.map((c, i) => (
              <motion.a
                key={c.title}
                href={c.href}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ delay: i * 0.07 }}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.color} mb-5`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{c.title}</p>
                <p className={`font-black ${c.color} mb-2 break-all group-hover:underline`}>{c.value}</p>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </motion.a>
            ))}
          </div>

          {/* Main content: Info + Form */}
          <div className="grid lg:grid-cols-2 gap-14">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.25 }}
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">What Can We Help With?</h2>
              <ul className="space-y-3 mb-10">
                {SUPPORT_TOPICS.map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-700">
                    <ArrowRight className="h-4 w-4 text-[#0057FF] flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="font-bold text-amber-700">Response Times During Pre-Launch</span>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  We are in pre-launch phase. Responses may take 1–2 business days. For urgent matters, please use WhatsApp at +92 339 0051068 for a faster response.
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-[#0057FF]" />
                  <span className="font-bold text-gray-900">Service Areas</span>
                </div>
                <p className="text-sm text-gray-600">
                  Athoo is launching in <strong>Rawalpindi and Islamabad</strong>, Pakistan. Expansion to other cities will follow.
                </p>
              </div>

              {/* Social */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Follow Us</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { href: "https://www.instagram.com/athoo_services", label: "Instagram", Icon: SiInstagram },
                    { href: "https://www.facebook.com/Athoo.Services/", label: "Facebook", Icon: SiFacebook },
                    { href: "https://www.tiktok.com/@athoo.pk", label: "TikTok", Icon: SiTiktok },
                    { href: "https://www.linkedin.com/company/123424195", label: "LinkedIn", Icon: FaLinkedin },
                    { href: "https://wa.me/923390051068", label: "WhatsApp", Icon: SiWhatsapp },
                  ].map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#0057FF] hover:text-white transition-colors"
                    >
                      <Icon aria-hidden="true" focusable="false" className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.25 }}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-10"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">Send a Message</h2>
              <p className="text-sm text-gray-500 mb-8">We'll get back to you by email as soon as possible.</p>
              <ContactForm />
            </motion.div>
          </div>
        </section>

        {/* FAQ CTA */}
        <section className="bg-gray-50 border-t border-gray-100 px-6 py-16 text-center">
          <div className="max-w-xl mx-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-5">
              <HelpCircle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Looking for Quick Answers?</h2>
            <p className="text-gray-600 mb-6">Check our FAQ page for instant answers to common questions about Athoo.</p>
            <Link href="/faq" className="inline-flex items-center gap-2 rounded-full bg-[#0057FF] px-8 py-4 font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Visit FAQ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
