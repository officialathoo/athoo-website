import { SiWhatsapp } from "react-icons/si";

export default function WhatsAppButton() {
  return (
    <div className="group fixed bottom-24 right-6 z-50 md:bottom-8 md:right-8">
      <div className="absolute -top-12 right-0 w-max translate-y-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none">
        Chat with us
      </div>
      <a
        href="https://wa.me/923390051068"
        target="_blank"
        rel="noopener noreferrer"
        className="animate-pulse-glow flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-green-500/50 transition-transform hover:scale-110 active:scale-95"
        aria-label="Chat with us on WhatsApp"
      >
        <SiWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
}