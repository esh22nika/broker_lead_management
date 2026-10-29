import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    proxy: {
      "/api": process.env.BLMS_BACKEND_URL || "http://localhost:8081",
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": process.env.BLMS_BACKEND_URL || "http://localhost:8081",
    },
  },
});
