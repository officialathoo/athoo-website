import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

// Layout
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import BecomeProvider from "@/pages/become-provider";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/admin";

const queryClient = new QueryClient();


function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  return null;
}


function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [state, setState] = React.useState<{ loading: boolean; enabled: boolean; message: string }>({ loading: true, enabled: false, message: "Athoo website is under maintenance. Please check back soon." });

  React.useEffect(() => {
    let alive = true;
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setState({ loading: false, enabled: Boolean(data?.maintenanceMode), message: data?.maintenanceMessage || "Athoo website is under maintenance. Please check back soon." });
      })
      .catch(() => alive && setState((s) => ({ ...s, loading: false })));
    return () => { alive = false; };
  }, []);

  if (location.startsWith("/admin") || state.loading || !state.enabled) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0057FF] via-blue-700 to-[#FF8A00] px-6 py-16 text-white flex items-center justify-center">
      <div className="max-w-xl rounded-[2rem] bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md border border-white/20">
        <img src="/athoo-logo.png" alt="Athoo" className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-white p-2 shadow-xl" />
        <h1 className="text-4xl font-black">Athoo is under maintenance</h1>
        <p className="mt-4 text-lg text-white/90">{state.message}</p>
        <p className="mt-6 text-sm text-white/75">We are improving the website. Please check back soon.</p>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  if (location.startsWith("/admin")) {
    return (
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/become-provider" component={BecomeProvider} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
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
            <MaintenanceGate><Router /></MaintenanceGate>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
