import { Link } from "wouter";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="athoo-navy pb-20 text-white md:pb-0">
      <div className="h-1 w-full bg-gradient-to-r from-[#0057FF] via-[#8A2BE2] to-[#FF8A00]" />

      <div className="container mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 inline-block">
              <img src="/athoo-logo.webp" alt="Athoo Logo" width={48} height={48} loading="lazy" decoding="async" className="h-12 w-auto rounded-xl bg-white p-1 object-contain" />
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Athoo is an upcoming Pakistani home services platform connecting customers with verified professionals in Rawalpindi and Islamabad. App launch and provider onboarding opening soon.
            </p>
            <div className="flex gap-3 mb-6">
              <a href="https://www.instagram.com/athoo_services" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Instagram">
                <SiInstagram aria-hidden="true" focusable="false" className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/Athoo.Services/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Facebook">
                <SiFacebook aria-hidden="true" focusable="false" className="h-4 w-4" />
              </a>
              <a href="https://www.tiktok.com/@athoo.pk" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="TikTok">
                <SiTiktok aria-hidden="true" focusable="false" className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/company/123424195" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="LinkedIn">
                <FaLinkedin aria-hidden="true" focusable="false" className="h-4 w-4" />
              </a>
            </div>
            <a
              href="https://wa.me/923390051068"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-400 transition-colors hover:text-white">About Athoo</Link></li>
              <li><Link href="/blogs" className="text-sm text-gray-400 transition-colors hover:text-white">Blog</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-gray-400 transition-colors hover:text-white">How It Works</Link></li>
              <li><Link href="/#waitlist" className="text-sm text-gray-400 transition-colors hover:text-white">Join Waitlist</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/services#electrician" className="text-sm text-gray-400 transition-colors hover:text-white">Electrician</Link></li>
              <li><Link href="/services#plumber" className="text-sm text-gray-400 transition-colors hover:text-white">Plumber</Link></li>
              <li><Link href="/services#ac" className="text-sm text-gray-400 transition-colors hover:text-white">AC Service</Link></li>
              <li><Link href="/services#cleaning" className="text-sm text-gray-400 transition-colors hover:text-white">Cleaning</Link></li>
              <li><Link href="/services" className="text-sm text-gray-400 transition-colors hover:text-white">All Services →</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-sm text-gray-400 transition-colors hover:text-white">FAQ</Link></li>
              <li><Link href="/support" className="text-sm text-gray-400 transition-colors hover:text-white">Help Centre</Link></li>
              <li><Link href="/become-provider" className="text-sm text-gray-400 transition-colors hover:text-white">Become a Provider</Link></li>
              <li><a href="mailto:support@athoo.pk" className="text-sm text-gray-400 transition-colors hover:text-white">support@athoo.pk</a></li>
              <li><a href="https://wa.me/923390051068" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 transition-colors hover:text-white">WhatsApp</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-300">Contact</h3>
            <ul className="space-y-3">
              <li><a href="mailto:info@athoo.pk" className="text-sm text-gray-400 transition-colors hover:text-white">info@athoo.pk</a></li>
              <li><a href="mailto:support@athoo.pk" className="text-sm text-gray-400 transition-colors hover:text-white">support@athoo.pk</a></li>
              <li><a href="mailto:official@athoo.pk" className="text-sm text-gray-400 transition-colors hover:text-white">official@athoo.pk</a></li>
              <li><a href="tel:+923390051068" className="text-sm text-gray-400 transition-colors hover:text-white">+92 339 0051068</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-300">
              © 2026 Athoo. All rights reserved. | Built in Pakistan 🇵🇰
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/privacy" className="text-sm text-gray-300 transition-colors hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-300 transition-colors hover:text-white">Terms</Link>
              <Link href="/cookie-policy" className="text-sm text-gray-300 transition-colors hover:text-white">Cookie Policy</Link>
              <Link href="/faq" className="text-sm text-gray-300 transition-colors hover:text-white">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
