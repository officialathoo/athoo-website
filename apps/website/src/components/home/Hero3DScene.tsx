import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
}

export default function Hero3DScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 40 : 100;
    const CONNECTION_DIST = isMobile ? 90 : 150;
    const SPEED = isMobile ? 0.25 : 0.4;

    const COLORS = ["#0057FF", "#FF8A00", "#4facfe", "#a78bfa", "#34d399"];
    const particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      canvas.width = Math.max(1, canvas.offsetWidth) * dpr;
      canvas.height = Math.max(1, canvas.offsetHeight) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        z: Math.random() * 800 + 200,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        vz: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 0.8,
        opacity: Math.random() * 0.7 + 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
    };
    if (!isMobile) {
      canvas.addEventListener("mousemove", onMouseMove);
    }

    const onVisibility = () => { pausedRef.current = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const project = (p: Particle, w: number, h: number) => {
      const fov = 500;
      const scale = fov / (fov + p.z);
      const mx = mouseRef.current.x * 30;
      const my = mouseRef.current.y * 30;
      return {
        px: (p.x - w / 2 + mx) * scale + w / 2,
        py: (p.y - h / 2 + my) * scale + h / 2,
        scale,
      };
    };

    let lastTime = 0;
    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_MS = 1000 / TARGET_FPS;

    const draw = (timestamp: number) => {
      animRef.current = requestAnimationFrame(draw);
      if (pausedRef.current) return;
      if (timestamp - lastTime < FRAME_MS) return;
      lastTime = timestamp;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const sorted = [...particles].sort((a, b) => b.z - a.z);

      for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i];
          const b = sorted[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONNECTION_DIST) {
            const pa = project(a, w, h);
            const pb = project(b, w, h);
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12 * pa.scale;
            ctx.beginPath();
            ctx.moveTo(pa.px, pa.py);
            ctx.lineTo(pb.px, pb.py);
            ctx.strokeStyle = `rgba(0, 87, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      for (const p of sorted) {
        const { px, py, scale } = project(p, w, h);
        const r = p.size * scale;
        const alpha = p.opacity * scale;

        if (!isMobile) {
          const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
          grd.addColorStop(0, p.color + "ff");
          grd.addColorStop(1, p.color + "00");
          ctx.beginPath();
          ctx.arc(px, py, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.globalAlpha = alpha * 0.35;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (p.z < 50 || p.z > 1000) p.vz *= -1;
      }
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.78 }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="athoo-galaxy-orb absolute left-[8%] top-[18%] h-32 w-32 rounded-full sm:h-44 sm:w-44" />
        <div className="athoo-galaxy-orb athoo-galaxy-orb-alt absolute bottom-[16%] right-[6%] h-40 w-40 rounded-full sm:h-56 sm:w-56" />
        <div className="athoo-galaxy-ring absolute left-1/2 top-[42%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[520px] sm:w-[520px]" />
      </div>
    </>
  );
}
