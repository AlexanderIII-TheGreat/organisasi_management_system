import type { Config } from "tailwindcss";

const config: Config = {
  // Pastikan path ini mencakup semua foldermu
content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Matikan dark mode sementara agar tidak berubah jadi hitam otomatis
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // --- Warna Kustom dari Desain HTML ---
        "on-primary-fixed": "#001453",
        "on-surface-variant": "#444653",
        "tertiary-fixed-dim": "#94ccff",
        "surface-container-highest": "#dfe3e7",
        "tertiary-fixed": "#cde5ff",
        "on-secondary-container": "#57657b",
        "surface-container-high": "#e4e9ed",
        "surface-container-low": "#f0f4f8",
        "background": "#f6fafe",
        "inverse-surface": "#2c3134",
        "on-tertiary-fixed-variant": "#004b74",
        "on-primary": "#ffffff",
        "surface-tint": "#3755c3",
        "on-secondary": "#ffffff",
        "on-tertiary-container": "#7ac2ff",
        "surface-dim": "#d6dade",
        "error-container": "#ffdad6",
        "surface-variant": "#dfe3e7",
        "secondary-fixed-dim": "#b9c7e0",
        "on-tertiary": "#ffffff",
        "on-secondary-fixed": "#0d1c2f",
        "outline-variant": "#c4c5d5",
        "primary": "#00288e", // Biru Utama
        "on-tertiary-fixed": "#001d32",
        "on-primary-container": "#a8b8ff",
        "primary-fixed-dim": "#b8c4ff",
        "secondary-container": "#d5e3fd",
        "on-error": "#ffffff",
        "on-background": "#171c1f",
        "on-surface": "#171c1f",
        "on-error-container": "#93000a",
        "secondary": "#515f74",
        "tertiary-container": "#004f7b",
        "surface-bright": "#f6fafe", // Background Terang
        "on-primary-fixed-variant": "#173bab",
        "tertiary": "#003758",
        "on-secondary-fixed-variant": "#3a485c",
        "inverse-primary": "#b8c4ff",
        "outline": "#757684",
        "inverse-on-surface": "#edf1f5",
        "error": "#ba1a1a",
        "primary-container": "#1e40af",
        "surface-container-lowest": "#ffffff", // Background Putih Card
        "surface": "#f6fafe", // Warna dasar Background
        "primary-fixed": "#dde1ff",
        "surface-container": "#eaeef2",
        "secondary-fixed": "#d5e3fd"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [], // Jika ada error di bagian ini sebelumnya, biarkan kosong dulu
};
export default config;