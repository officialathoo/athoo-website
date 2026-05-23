import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function Counter({ end, duration = 2, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // easeOutExpo
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const stats = [
    { num: 500, suffix: "+", label: "Providers Registered", color: "bg-green-500" },
    { num: 8, suffix: "", label: "Service Categories", color: "bg-blue-500" },
    { num: 10, suffix: "+", label: "Cities", color: "bg-orange-500" },
    { num: 2025, suffix: "", label: "Launch Target", color: "bg-purple-500" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#081120] py-24">
      {/* Grid pattern overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="text-5xl font-black text-white md:text-6xl lg:text-7xl">
                <Counter end={stat.num} suffix={stat.suffix} />
              </div>
              <div className={`mt-4 h-1.5 w-12 rounded-full ${stat.color}`} />
              <p className="mt-4 text-lg font-medium text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}