import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    apple: { sizes: [180], padding: 0, resizeOptions: { background: "#FF6A1A" } },
    maskable: { sizes: [512], padding: 0, resizeOptions: { background: "#FF6A1A" } },
    transparent: { sizes: [64, 192, 512], padding: 0 },
  },
  images: ["public/favicon.svg"],
});
