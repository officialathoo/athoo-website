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
import HomeContact from "@/components/home/HomeContact";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

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
        <title>Athoo — Pakistan’s Smart Home Services App Launching Soon</title>
        <meta name="description" content="Athoo is an upcoming Pakistani home services app for customers and verified providers. Join the launch waitlist for 10+ service categories coming soon." />
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
        <FaqSection />
        <HomeContact />
      </div>
    </>
  );
}