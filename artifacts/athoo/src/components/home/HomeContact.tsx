import ContactForm from "@/components/forms/ContactForm";
import { Mail, Phone } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";

export default function HomeContact() {
  return (
    <section className="bg-[#f9fafb]">
      <div className="grid lg:grid-cols-2">
        {/* Left Side (Dark Navy) */}
        <div className="athoo-navy flex flex-col justify-center px-8 py-24 text-white lg:px-24">
          <h2 className="mb-12 text-4xl font-black md:text-5xl">Get in Touch</h2>

          <div className="mb-12 space-y-8">
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#FF8A00]">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email Us</p>
                <a href="mailto:official.athoo@gmail.com" className="text-lg font-medium text-[#FF8A00] transition-colors hover:text-orange-400">
                  official.athoo@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#FF8A00]">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Call Us</p>
                <a href="tel:+923390051068" className="text-lg font-medium text-[#FF8A00] transition-colors hover:text-orange-400">
                  +92 339 0051068
                </a>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-400">Follow Us</p>
            <div className="flex gap-4">
              <a href="https://instagram.com/athoo_services" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <SiInstagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/athoo_services" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com/athoo.pk" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <SiTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>

          <a
            href="https://wa.me/923390051068"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-max items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 font-bold text-white transition-transform hover:scale-105"
          >
            <SiWhatsapp className="h-6 w-6" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Right Side (White) */}
        <div className="flex flex-col justify-center px-8 py-24 lg:px-24">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-12">
            <h3 className="mb-8 text-3xl font-bold text-gray-900">Send a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}