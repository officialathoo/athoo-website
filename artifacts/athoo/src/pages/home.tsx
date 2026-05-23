import HomeHero from "@/components/home/HomeHero";
import HowItWorks from "@/components/home/HowItWorks";
import ServicesGrid from "@/components/home/ServicesGrid";
import AppShowcase from "@/components/home/AppShowcase";
import TrustSafety from "@/components/home/TrustSafety";
import WaitlistSection from "@/components/home/WaitlistSection";
import ProviderTeaser from "@/components/home/ProviderTeaser";
import HomeContact from "@/components/home/HomeContact";
import { Helmet } from "react-helmet-async";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Athoo | Pakistan's Smart Home Services Platform</title>
        <meta name="description" content="Find trusted professionals for everyday home services in Pakistan. Fast, reliable, and secure." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <HomeHero />
        <HowItWorks />
        <ServicesGrid />
        <AppShowcase />
        <TrustSafety />
        <WaitlistSection />
        <ProviderTeaser />
        <HomeContact />
      </div>
    </>
  );
}