import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Served from the root of srujaniyengar.github.io (see .github/workflows/deploy-pages.yml).
  base: "/",
});
