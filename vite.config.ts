import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT || 3000);
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "public")
    },
    dedupe: ["react", "react-dom"]
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  },
  server: {
    port,
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: true
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true
  }
});
