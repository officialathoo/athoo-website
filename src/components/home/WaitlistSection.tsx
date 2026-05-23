import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { submitToAthooEmail } from "@/lib/emailSubmit";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [timeLeft, setTimeLeft] = useState({
    days: 30, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const stored = localStorage.getItem("athooLaunchCountdownTarget");
    const targetDate = stored ? Number(stored) : Date.now() + 30 * 24 * 60 * 60 * 1000;
    if (!stored) localStorage.setItem("athooLaunchCountdownTarget", String(targetDate));

    const interval = setInterval(() => {
      const distance = Math.max(targetDate - Date.now(), 0);
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await submitToAthooEmail("Waitlist Signup", { email });
      toast({
        title: "Waitlist Joined",
        description: "Thank you. Your email has been received by Athoo.",
      });
      setEmail("");
    } catch {
      toast({
        variant: "destructive",
        title: "Waitlist Status",
        description: "Could not submit online. Please email official.athoo@gmail.com or WhatsApp +92 339 0051068.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="bg-gradient-to-br from-[#0057FF] via-[#174bff] to-[#003ACC] py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <div className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
            Launching Soon — Target Preview: Around 1 Month
          </div>
          <h2 className="mb-8 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
            Get Athoo Launch Updates
          </h2>

          <div className="mb-10 grid grid-cols-4 gap-2 sm:flex sm:justify-center sm:gap-4 md:gap-6">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex min-w-0 flex-col items-center rounded-2xl bg-white/10 p-3 backdrop-blur sm:w-24 sm:p-4">
                <span className="text-2xl font-bold text-white sm:text-4xl">{value.toString().padStart(2, '0')}</span>
                <span className="mt-1 text-[10px] uppercase tracking-wider text-white/70 sm:text-xs">{unit}</span>
              </div>
            ))}
          </div>

          <p className="mb-5 text-sm text-white/80">Join the Athoo launch waitlist</p>

          <form onSubmit={handleSubmit} className="mx-auto mb-10 grid max-w-xl gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-14 w-full rounded-2xl border-0 bg-white px-5 py-4 text-base text-gray-900 shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 sm:rounded-l-full sm:rounded-r-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-14 rounded-2xl bg-[#FF8A00] px-8 py-4 font-bold text-white shadow-xl transition-colors hover:bg-orange-600 disabled:opacity-70 sm:rounded-l-none sm:rounded-r-full"
            >
              {isSubmitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Join Waitlist"}
            </button>
          </form>

          <div className="mb-10 grid gap-3 sm:flex sm:justify-center">
            <div className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur">App Store Coming Soon</div>
            <div className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur">Google Play Coming Soon</div>
          </div>

          <div className="flex justify-center gap-4">
            <a href="https://www.instagram.com/athoo_services/" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><SiInstagram className="h-5 w-5" /></a>
            <a href="https://www.facebook.com/share/17YFFojFAc/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><SiFacebook className="h-5 w-5" /></a>
            <a href="https://www.tiktok.com/@athoo.pk" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><SiTiktok className="h-5 w-5" /></a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
