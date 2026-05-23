import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import { useJoinWaitlist, useGetWaitlistCount } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetWaitlistCountQueryKey } from "@workspace/api-client-react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const joinWaitlist = useJoinWaitlist();
  const queryClient = useQueryClient();
  const { data: waitlistData } = useGetWaitlistCount();

  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date("2026-12-31T00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    joinWaitlist.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          toast({
            title: "Waitlist Joined",
            description: "Thank you. You are on the Athoo launch waitlist.",
          });
          setEmail("");
          queryClient.invalidateQueries({ queryKey: getGetWaitlistCountQueryKey() });
        },
        onError: (error) => {
          let desc = "Failed to join waitlist. Please try again.";
          if (error.error === "Already registered" || error.error?.includes("already")) {
             desc = "You are already on the list!";
          }
          toast({
            variant: "destructive",
            title: "Waitlist Status",
            description: desc,
          });
        },
      }
    );
  };

  return (
    <section id="waitlist" className="bg-gradient-to-br from-[#0057FF] to-[#003ACC] py-24">
      <div className="container mx-auto max-w-4xl px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-8 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
            Launching Soon
          </div>
          
          <h2 className="mb-12 text-5xl font-black text-white md:text-6xl">
            Get Athoo Launch Updates
          </h2>

          <div className="mb-12 flex justify-center gap-4 md:gap-6">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex w-20 flex-col items-center rounded-xl bg-white/10 p-4 backdrop-blur md:w-24">
                <span className="text-3xl font-bold text-white md:text-4xl">
                  {value.toString().padStart(2, '0')}
                </span>
                <span className="mt-1 text-xs uppercase tracking-wider text-gray-300">
                  {unit}
                </span>
              </div>
            ))}
          </div>

          <p className="mb-6 text-sm text-white/80">
            Join the Athoo launch waitlist
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mb-12 flex max-w-xl flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-t-2xl sm:rounded-l-full sm:rounded-tr-none border-0 px-6 py-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={joinWaitlist.isPending}
              className="flex w-full sm:w-auto items-center justify-center rounded-b-2xl sm:rounded-r-full sm:rounded-bl-none bg-[#FF8A00] px-8 py-4 font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
            >
              {joinWaitlist.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Join Waitlist"}
            </button>
          </form>

          <div className="mb-12 flex justify-center gap-4">
            <div className="glass flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white">
              App Store Coming Soon
            </div>
            <div className="glass flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white">
              Google Play Coming Soon
            </div>
          </div>

          <div className="flex justify-center gap-4">
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
        </motion.div>
      </div>
    </section>
  );
}