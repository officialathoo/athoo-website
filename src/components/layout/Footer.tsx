import { Link } from "wouter";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="athoo-navy text-white">
      <div className="h-1 w-full bg-gradient-to-r from-[#0057FF] via-[#8A2BE2] to-[#FF8A00]" />
      
      <div className="container mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          
          <div className="lg:col-span-1">
            <Link href="/" className="mb-6 inline-block">
              <img src="/athoo-logo.webp" alt="Athoo Logo" className="h-12 w-auto rounded-xl bg-white p-1 object-contain" />
            </Link>
            <p className="mb-8 text-sm leading-relaxed text-gray-400">
              Athoo is an upcoming Pakistani home services app. App launch, provider onboarding and 10+ service categories are coming soon.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/athoo_services/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <SiInstagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/share/17YFFojFAc/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <SiFacebook className="h-4 w-4" />
              </a>
              <a href="https://www.tiktok.com/@athoo.pk" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <SiTiktok className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm text-gray-400 transition-colors hover:text-white">About</Link></li>
              <li><Link href="/about" className="text-sm text-gray-400 transition-colors hover:text-white">Launch Updates</Link></li>
              <li><Link href="/#waitlist" className="text-sm text-gray-400 transition-colors hover:text-white">Waitlist</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Services</h3>
            <ul className="space-y-4">
              <li><Link href="/services#electrician" className="text-sm text-gray-400 transition-colors hover:text-white">Electrician</Link></li>
              <li><Link href="/services#plumber" className="text-sm text-gray-400 transition-colors hover:text-white">Plumber</Link></li>
              <li><Link href="/services#ac" className="text-sm text-gray-400 transition-colors hover:text-white">AC Service</Link></li>
              <li><Link href="/services#carpenter" className="text-sm text-gray-400 transition-colors hover:text-white">Carpenter</Link></li>
              <li><Link href="/services" className="text-sm text-gray-400 transition-colors hover:text-white">All Services</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">For Providers</h3>
            <ul className="space-y-4">
              <li><Link href="/become-provider" className="text-sm text-gray-400 transition-colors hover:text-white">Become a Provider</Link></li>
              <li><Link href="/become-provider" className="text-sm text-gray-400 transition-colors hover:text-white">Provider Waitlist</Link></li>
              <li><Link href="/become-provider" className="text-sm text-gray-400 transition-colors hover:text-white">Onboarding Soon</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 transition-colors hover:text-white">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li><a href="mailto:official.athoo@gmail.com" className="text-sm text-gray-400 transition-colors hover:text-white">official.athoo@gmail.com</a></li>
              <li><a href="tel:+923390051068" className="text-sm text-gray-400 transition-colors hover:text-white">+92 339 0051068</a></li>
              <li><a href="https://wa.me/923390051068" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 transition-colors hover:text-white">WhatsApp Chat</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-white/10 pt-8 sm:flex-row">
          <p className="mb-4 text-sm text-gray-500 sm:mb-0">
            © 2026 Athoo. All rights reserved. | Built in Pakistan
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 transition-colors hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}