import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src"),
      "@components": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/components"),
      "@pages": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/pages"),
      "@styles": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/styles"),
      "@data": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/data"),
      "@layout": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/layout"),
      "@hooks": path.resolve(path.dirname(new URL(import.meta.url).pathname), "src/hooks")
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
