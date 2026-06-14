import React, { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Eagerly loaded public pages (critical path)
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Lazy loaded pages (non-critical)
const BecomeProvider = lazy(() => import("@/pages/become-provider"));
const HowItWorks = lazy(() => import("@/pages/how-it-works"));
const Support = lazy(() => import("@/pages/support"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const FAQ = lazy(() => import("@/pages/faq"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const Blogs = lazy(() => import("@/pages/blogs"));
const BlogPost = lazy(() => import("@/pages/blog-post"));

// Admin — lazy loaded, separate bundle
const Admin = lazy(() => import("@/pages/admin"));

const queryClient = new QueryClient();

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
  }, [location]);
  return null;
}

function Router() {
  const [location] = useLocation();

  if (location.startsWith("/admin")) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  return (
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
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </MainLayout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
