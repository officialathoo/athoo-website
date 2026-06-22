import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5173;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "public"),
      "react-helmet-async": path.resolve(import.meta.dirname, "src/lib/helmetSafe.tsx"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          // React ecosystem — cached separately for long-lived cache hits
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react/jsx-runtime") ||
            id.includes("/scheduler/")
          ) return "vendor-react";
          // UI primitives
          if (id.includes("@radix-ui")) return "vendor-ui";
          // Icons
          if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";
          // Data fetching
          if (id.includes("@tanstack")) return "vendor-query";
          // Router
          if (id.includes("wouter")) return "vendor-router";
          // Form / validation stack
          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform") ||
            id.includes("/zod/") ||
            id.includes("react-day-picker")
          ) return "vendor-forms";
          // Date utilities
          if (id.includes("date-fns")) return "vendor-date";
          // Charts — only pulled in by lazy admin page
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) return "vendor-charts";
          // Everything else
          return "vendor";
        },
      },
    },
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "https://thoo-api.onrender.com",
        changeOrigin: true,
        rewrite: (p) => p,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
