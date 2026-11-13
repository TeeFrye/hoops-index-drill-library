import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    apple: { sizes: [180], padding: 0, resizeOptions: { background: "#9d0d14" } },
    maskable: { sizes: [512], padding: 0, resizeOptions: { background: "#9d0d14" } },
    transparent: { sizes: [64, 192, 512], padding: 0 },
  },
  images: ["public/favicon.svg"],
});
