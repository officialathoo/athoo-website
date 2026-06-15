import HomeHero from "@/components/home/HomeHero";
import StatsSection from "@/components/home/StatsSection";
import HowItWorks from "@/components/home/HowItWorks";
import ServicesGrid from "@/components/home/ServicesGrid";
import AppShowcase from "@/components/home/AppShowcase";
import TrustSafety from "@/components/home/TrustSafety";
import WaitlistSection from "@/components/home/WaitlistSection";
import ProviderTeaser from "@/components/home/ProviderTeaser";
import FaqSection from "@/components/home/FaqSection";
import CompleteInfoSection from "@/components/home/CompleteInfoSection";
import BlogPreview from "@/components/home/BlogPreview";
import HomeContact from "@/components/home/HomeContact";
import CountdownTimer from "@/components/home/CountdownTimer";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Athoo",
  "url": "https://athoo.pk/",
  "logo": "https://athoo.pk/athoo-logo.png",
  "description": "Pakistan's upcoming home services platform connecting customers with verified electricians, plumbers, AC technicians, cleaners, carpenters, painters and more in Rawalpindi and Islamabad.",
  "foundingLocation": { "@type": "Place", "name": "Rawalpindi, Pakistan" },
  "areaServed": [
    { "@type": "City", "name": "Rawalpindi" },
    { "@type": "City", "name": "Islamabad" },
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+92-339-0051068",
      "contactType": "customer service",
      "email": "official@athoo.pk",
      "availableLanguage": ["English", "Urdu"],
      "areaServed": "PK",
    },
  ],
  "sameAs": [
    "https://instagram.com/athoo_services",
    "https://facebook.com/Athoo.Services/",
    "https://tiktok.com/@athoo.pk",
    "https://linkedin.com/company/123424195",
  ],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Athoo Home Services",
  "url": "https://athoo.pk/",
  "logo": "https://athoo.pk/athoo-logo.png",
  "image": "https://athoo.pk/athoo-logo.png",
  "description": "Athoo connects homeowners in Rawalpindi and Islamabad with verified, professional home service providers — electricians, plumbers, AC technicians, cleaners, carpenters, painters and more.",
  "telephone": "+92-339-0051068",
  "email": "official@athoo.pk",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rawalpindi",
    "addressRegion": "Punjab",
    "addressCountry": "PK",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "33.6007",
    "longitude": "73.0679",
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "18:00",
  },
  "priceRange": "PKR",
  "currenciesAccepted": "PKR",
  "paymentAccepted": "Cash, Bank Transfer",
  "serviceArea": [
    { "@type": "City", "name": "Rawalpindi" },
    { "@type": "City", "name": "Islamabad" },
  ],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Athoo",
  "url": "https://athoo.pk/",
  "description": "Pakistan's upcoming trusted home services marketplace for Rawalpindi and Islamabad.",
  "inLanguage": "en",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://athoo.pk/services?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Athoo?",
      "acceptedAnswer": { "@type": "Answer", "text": "Athoo is Pakistan's upcoming home services platform that connects customers in Rawalpindi and Islamabad with verified, professional service providers — including electricians, plumbers, AC technicians, cleaners, carpenters, and painters." },
    },
    {
      "@type": "Question",
      "name": "When will Athoo launch?",
      "acceptedAnswer": { "@type": "Answer", "text": "Athoo is preparing to launch in Rawalpindi and Islamabad. Join the waitlist at athoo.pk to be notified as soon as we go live." },
    },
    {
      "@type": "Question",
      "name": "How do I join the Athoo waitlist?",
      "acceptedAnswer": { "@type": "Answer", "text": "Visit athoo.pk and fill out the waitlist form with your name, email, and phone number. We will notify you as soon as Athoo launches in your area." },
    },
    {
      "@type": "Question",
      "name": "How can I become a service provider on Athoo?",
      "acceptedAnswer": { "@type": "Answer", "text": "Service providers can register their interest at athoo.pk/become-provider. Once onboarding opens, you will be guided through the verification process and profile setup." },
    },
    {
      "@type": "Question",
      "name": "What services will Athoo offer?",
      "acceptedAnswer": { "@type": "Answer", "text": "Athoo will offer 10+ home service categories including electrical work, plumbing, AC installation and repair, home cleaning, carpentry, painting, appliance repair, and general home maintenance in Rawalpindi and Islamabad." },
    },
    {
      "@type": "Question",
      "name": "Are Athoo service providers verified?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Every provider on Athoo goes through a verification process including identity confirmation and experience review before being listed on the platform." },
    },
  ],
};

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldScroll = window.location.hash === "#waitlist" || window.location.search.includes("cta=waitlist");
    if (!shouldScroll) return;
    window.setTimeout(() => {
      document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

  return (
    <>
      <Helmet>
        <title>Athoo | Trusted Home Services in Rawalpindi & Islamabad</title>
        <meta name="description" content="Athoo is Pakistan's upcoming home services platform — connecting customers with verified electricians, plumbers, AC technicians, cleaners, carpenters, painters and more in Rawalpindi and Islamabad. Join the waitlist." />
        <link rel="canonical" href="https://athoo.pk/" />
        <meta property="og:title" content="Athoo | Trusted Home Services in Rawalpindi & Islamabad" />
        <meta property="og:description" content="Pakistan's upcoming home services marketplace. Connect with verified electricians, plumbers, AC technicians, cleaners and more in Rawalpindi and Islamabad." />
        <meta property="og:url" content="https://athoo.pk/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Athoo" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <HomeHero />
        <StatsSection />
        <HowItWorks />
        <ServicesGrid />
        <AppShowcase />
        <TrustSafety />
        <div id="waitlist">
          <WaitlistSection />
        </div>
        <ProviderTeaser />
        <CompleteInfoSection />
        <CountdownTimer />
        <BlogPreview />
        <FaqSection />
        <HomeContact />
      </div>
    </>
  );
}
