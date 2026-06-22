import React, { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { initScrollReveal, refreshScrollReveal } from "@/lib/scrollReveal";

import MainLayout from "@/components/layout/MainLayout";
import MaintenanceGate from "@/components/MaintenanceGate";

// Only Home is eager — it's the critical first-paint route
import Home from "@/pages/home";

// All other public pages — lazy loaded on demand
const About = lazy(() => import("@/pages/about"));
const Services = lazy(() => import("@/pages/services"));
const Contact = lazy(() => import("@/pages/contact"));
const BecomeProvider = lazy(() => import("@/pages/become-provider"));
const HowItWorks = lazy(() => import("@/pages/how-it-works"));
const Support = lazy(() => import("@/pages/support"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const FAQ = lazy(() => import("@/pages/faq"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const Blogs = lazy(() => import("@/pages/blogs"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Admin — separate chunk, never bundled with public site
const Admin = lazy(() => import("@/pages/admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-8 w-8 rounded-full border-4 border-[#0057FF] border-t-transparent animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setTimeout(refreshScrollReveal, 120);
  }, [location]);
  return null;
}

function GlobalReveal() {
  useEffect(() => {
    initScrollReveal();
    const timer = setTimeout(initScrollReveal, 400);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

function Router() {
  const [location] = useLocation();

  if (location.startsWith("/admin")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/admin" component={Admin} />
          <Route path="/admin/:path*" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <MaintenanceGate>
      <MainLayout>
        <Suspense fallback={<PageLoader />}>
          <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/become-provider" component={BecomeProvider} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/contact" component={Contact} />
          <Route path="/support" component={Support} />
          <Route path="/faq" component={FAQ} />
          <Route path="/blogs" component={Blogs} />
          <Route path="/blogs/:slug" component={BlogPost} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route component={NotFound} />
          </Switch>
        </Suspense>
      </MainLayout>
    </MaintenanceGate>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <GlobalReveal />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
