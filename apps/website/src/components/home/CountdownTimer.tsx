import { useEffect, useMemo, useState } from "react";

const DEFAULT_LAUNCH_DATE = "2026-09-01T00:00:00+05:00";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ launchDate = DEFAULT_LAUNCH_DATE }: { launchDate?: string }) {
  const target = useMemo(() => {
    const parsed = new Date(launchDate).getTime();
    return Number.isFinite(parsed) ? parsed : new Date(DEFAULT_LAUNCH_DATE).getTime();
  }, [launchDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(target));
    const timer = window.setInterval(() => setTimeLeft(calculateTimeLeft(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const items = [
    ["Days", timeLeft.days],
    ["Hours", timeLeft.hours],
    ["Minutes", timeLeft.minutes],
    ["Seconds", timeLeft.seconds],
  ] as const;

  return (
    <div className="mx-auto mb-8 grid max-w-xl grid-cols-4 gap-2 sm:gap-3" aria-label="Athoo launch countdown">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-white/15 px-2 py-4 text-center text-white shadow-lg backdrop-blur">
          <div className="text-2xl font-black leading-none sm:text-4xl">{String(value).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/80 sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}
