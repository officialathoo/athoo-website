import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motionLite";
import { handleWaitlistClick } from "@/lib/navigation";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location === "/";
  const isDark = isHomePage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 48);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const close = () => setIsMobileMenuOpen(false);
  const scrollToWaitlist = () => {
    close();
    handleWaitlistClick();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blogs" },
    { name: "Become Provider", path: "/become-provider" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/20 bg-white/90 shadow-lg shadow-blue-950/8 backdrop-blur-2xl"
          : isDark
          ? "bg-transparent"
          : "bg-white/55 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" onClick={close} className="flex items-center gap-3">
          <img
            src="/athoo-logo.webp"
            alt="Athoo"
            width={48}
            height={48}
            decoding="async"
            className="h-10 w-10 rounded-xl object-contain sm:h-12 sm:w-12"
          />
          <div className="leading-tight">
            <span className={`block text-xl font-black tracking-tight transition-colors ${isDark ? "text-white" : "text-[#081120]"}`}>
              Athoo
            </span>
            <span className={`hidden text-[11px] font-bold uppercase tracking-wider sm:block transition-colors ${isDark ? "text-blue-300" : "text-blue-600"}`}>
              Launching Soon
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                location === link.path
                  ? isDark
                    ? "bg-white/15 text-white"
                    : "bg-blue-50 text-[#0057FF]"
                  : isDark
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={scrollToWaitlist}
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-[#0057FF] px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-500 pointer-events-auto touch-manipulation"
          >
            <BellRing className="h-4 w-4" /> Join Waitlist
          </button>
        </div>

        <button
          aria-label="Open menu"
          className={`rounded-2xl border p-3 shadow-sm lg:hidden transition-colors ${
            isDark
              ? "border-white/20 bg-white/10 text-white backdrop-blur"
              : "border-slate-200 bg-white text-slate-700"
          }`}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] z-50 mx-3 overflow-hidden rounded-[2rem] border border-white/20 bg-[#060d1c]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:hidden"
          >
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={close}
                  className={`rounded-2xl px-5 py-4 text-lg font-black transition-colors ${
                    location === link.path
                      ? "bg-blue-600/20 text-blue-300"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={scrollToWaitlist}
                className="mt-3 rounded-2xl bg-[#0057FF] px-5 py-4 text-lg font-black text-white shadow-xl shadow-blue-600/30 active:scale-95 pointer-events-auto touch-manipulation"
              >
                Join Waitlist
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
