import { useEffect, useMemo, useState } from "react";

const DEFAULT_LAUNCH_WINDOW_DAYS = 72;
const STORAGE_KEY = "athoo_launch_target_v2";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function calculateTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function resolveTarget(launchDate?: string): number {
  if (launchDate) {
    const parsed = new Date(launchDate).getTime();
    if (Number.isFinite(parsed) && parsed > Date.now()) return parsed;
  }

  if (typeof window !== "undefined") {
    const existing = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(existing) && existing > Date.now()) return existing;
    const next = Date.now() + DEFAULT_LAUNCH_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  }

  return Date.now() + DEFAULT_LAUNCH_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export default function CountdownTimer({ launchDate }: { launchDate?: string }) {
  const target = useMemo(() => resolveTarget(launchDate), [launchDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  useEffect(() => {
    try {
      window.localStorage.removeItem("athoo_launch_countdown_start");
      window.localStorage.removeItem("athoo_launch_target");
      window.localStorage.removeItem("athoo_countdown_started_at");
    } catch {}
    setTimeLeft(calculateTimeLeft(target));
    const timer = window.setInterval(() => setTimeLeft(calculateTimeLeft(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const items = [["Days", timeLeft.days], ["Hours", timeLeft.hours], ["Minutes", timeLeft.minutes], ["Seconds", timeLeft.seconds]] as const;

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
