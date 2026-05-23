import { Link } from "wouter";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import athooLogo from "@assets/icon_1779544245383.png";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <img src={athooLogo} alt="Athoo Logo" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Pakistan's trusted home services marketplace. Fast, reliable, and built for you.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="https://instagram.com/athoo_services" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <SiInstagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/athoo_services" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com/athoo.pk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <SiTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/become-provider" className="text-sm text-muted-foreground hover:text-primary transition-colors">Become a Provider</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground flex flex-col">
                <span className="font-medium text-foreground">Email:</span>
                <a href="mailto:official.athoo@gmail.com" className="hover:text-primary transition-colors">official.athoo@gmail.com</a>
              </li>
              <li className="text-sm text-muted-foreground flex flex-col">
                <span className="font-medium text-foreground">Phone:</span>
                <a href="tel:+923390051068" className="hover:text-primary transition-colors">+92 339 0051068</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Athoo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}