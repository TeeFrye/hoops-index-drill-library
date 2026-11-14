import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves the site from /hoops-index-drill-library/
const base = process.env.BASE_PATH ?? "/hoops-index-drill-library/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Hoops Index",
        short_name: "Hoops Index",
        description: "Youth basketball drills, practice plans and a practice timer — built for the sideline.",
        theme_color: "#9d0d14",
        background_color: "#9d0d14",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // The link-preview image is only fetched by other sites, never by the app.
        globIgnores: ["**/og-image.png"],
      },
    }),
  ],
});
