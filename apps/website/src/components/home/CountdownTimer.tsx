import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LAUNCH_DATE = new Date("2026-09-01T00:00:00+05:00");

function getTimeLeft() {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    launched: false,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px] text-center shadow-lg">
        <span className="text-3xl md:text-5xl font-black text-white tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-xs md:text-sm font-semibold text-blue-100 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.launched) return null;

  return (
    <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.p
          className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
        >
          Launching in
        </motion.p>
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-white mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ delay: 0.05 }}
        >
          Pakistan's Smart Home Services App Is Almost Here
        </motion.h2>

        <motion.div
          className="flex items-start justify-center gap-3 md:gap-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ delay: 0.1 }}
        >
          <Digit value={time.days} label="Days" />
          <span className="text-3xl md:text-5xl font-black text-white/60 mt-3 md:mt-4">:</span>
          <Digit value={time.hours} label="Hours" />
          <span className="text-3xl md:text-5xl font-black text-white/60 mt-3 md:mt-4">:</span>
          <Digit value={time.minutes} label="Minutes" />
          <span className="text-3xl md:text-5xl font-black text-white/60 mt-3 md:mt-4">:</span>
          <Digit value={time.seconds} label="Seconds" />
        </motion.div>

        <motion.p
          className="mt-10 text-blue-100 text-sm md:text-base"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ delay: 0.2 }}
        >
          Target launch: <strong className="text-white">September 1, 2026</strong> · Rawalpindi &amp; Islamabad
        </motion.p>
      </div>
    </section>
  );
}
