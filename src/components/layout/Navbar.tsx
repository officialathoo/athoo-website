import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const close = () => setIsMobileMenuOpen(false);
  const scrollToWaitlist = () => {
    close();
    if (location !== "/") {
      window.location.href = "/#waitlist";
      return;
    }
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Become Provider", path: "/become-provider" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${isScrolled ? "border-b border-white/30 bg-white/85 shadow-lg shadow-blue-950/5 backdrop-blur-2xl" : "bg-white/55 backdrop-blur-xl"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" onClick={close} className="flex items-center gap-3">
          <img src="/athoo-logo.png" alt="Athoo" className="h-10 w-10 rounded-xl object-contain sm:h-12 sm:w-12" />
          <div className="leading-tight">
            <span className="block text-xl font-black tracking-tight text-[#081120]">Athoo</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-wider text-blue-600 sm:block">Launching Soon</span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path} className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${location === link.path ? "bg-blue-50 text-[#0057FF]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              {link.name}
            </Link>
          ))}
          <button onClick={scrollToWaitlist} className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#0057FF] px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700">
            <BellRing className="h-4 w-4" /> Join Waitlist
          </button>
        </div>

        <button aria-label="Open menu" className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm lg:hidden" onClick={() => setIsMobileMenuOpen((v) => !v)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }} className="fixed inset-x-0 top-[72px] z-50 mx-3 overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 p-4 shadow-2xl shadow-blue-950/15 backdrop-blur-2xl lg:hidden">
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path} onClick={close} className={`rounded-2xl px-5 py-4 text-lg font-black ${location === link.path ? "bg-blue-50 text-[#0057FF]" : "text-slate-900 hover:bg-slate-50"}`}>
                  {link.name}
                </Link>
              ))}
              <button onClick={scrollToWaitlist} className="mt-3 rounded-2xl bg-[#0057FF] px-5 py-4 text-lg font-black text-white shadow-xl shadow-blue-600/25 active:scale-95">
                Join Waitlist
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
