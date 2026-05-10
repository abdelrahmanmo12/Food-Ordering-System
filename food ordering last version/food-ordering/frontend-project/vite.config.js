import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    // Keep legacy code that references `process.env.*` from CRA from crashing.
    "process.env": {},
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});

