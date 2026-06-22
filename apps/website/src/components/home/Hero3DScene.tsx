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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = ["#0057FF", "#FF8A00", "#4facfe", "#a78bfa", "#34d399"];
    const particles: Particle[] = [];
    const COUNT = 120;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        z: Math.random() * 800 + 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
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
    canvas.addEventListener("mousemove", onMouseMove);

    const project = (p: Particle, w: number, h: number) => {
      const fov = 500;
      const scale = fov / (fov + p.z);
      const mx = mouseRef.current.x * 40;
      const my = mouseRef.current.y * 40;
      return {
        px: (p.x - w / 2 + mx) * scale + w / 2,
        py: (p.y - h / 2 + my) * scale + h / 2,
        scale,
      };
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const sorted = [...particles].sort((a, b) => b.z - a.z);

      for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i];
          const b = sorted[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 160) {
            const pa = project(a, w, h);
            const pb = project(b, w, h);
            const alpha = (1 - dist / 160) * 0.15 * pa.scale;
            ctx.beginPath();
            ctx.moveTo(pa.px, pa.py);
            ctx.lineTo(pb.px, pb.py);
            ctx.strokeStyle = `rgba(0, 87, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const p of sorted) {
        const { px, py, scale } = project(p, w, h);
        const r = p.size * scale;
        const alpha = p.opacity * scale;

        const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
        grd.addColorStop(0, p.color + "ff");
        grd.addColorStop(1, p.color + "00");

        ctx.beginPath();
        ctx.arc(px, py, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.globalAlpha = alpha * 0.4;
        ctx.fill();

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

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.65 }}
    />
  );
}
