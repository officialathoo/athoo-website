import React, { Suspense } from "react";
import HomeHero from "@/components/home/HomeHero";
import { Helmet } from "react-helmet-async";

const StatsSection = React.lazy(() => import("@/components/home/StatsSection"));
const HowItWorks = React.lazy(() => import("@/components/home/HowItWorks"));
const ServicesGrid = React.lazy(() => import("@/components/home/ServicesGrid"));
const AppShowcase = React.lazy(() => import("@/components/home/AppShowcase"));
const TrustSafety = React.lazy(() => import("@/components/home/TrustSafety"));
const WaitlistSection = React.lazy(() => import("@/components/home/WaitlistSection"));
const ProviderTeaser = React.lazy(() => import("@/components/home/ProviderTeaser"));
const FaqSection = React.lazy(() => import("@/components/home/FaqSection"));
const HomeContact = React.lazy(() => import("@/components/home/HomeContact"));

function SectionLoader() {
  return <div className="h-40 bg-gradient-to-b from-white to-blue-50" aria-hidden="true" />;
}

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Athoo — Pakistan’s Smart Home Services App Launching Soon</title>
        <meta name="description" content="Athoo is an upcoming Pakistani home services app for customers and verified providers. Join the launch waitlist for 10+ service categories coming soon." />
        <link rel="canonical" href="https://athoo-website-athoo.vercel.app/" />
      </Helmet>
      
      <div className="flex min-h-screen flex-col">
        <HomeHero />
        <Suspense fallback={<SectionLoader />}>
          <StatsSection />
          <HowItWorks />
          <ServicesGrid />
          <AppShowcase />
          <TrustSafety />
          <div id="waitlist">
            <WaitlistSection />
          </div>
          <ProviderTeaser />
          <FaqSection />
          <HomeContact />
        </Suspense>
      </div>
    </>
  );
}
