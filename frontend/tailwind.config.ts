import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-rose': '#fc10ca',
        'midnight-blue': '#1a187d',
        'lavender-mist': '#f6f2f9',
        'sky-aqua': '#09c7df',
      },
    },
  },
  plugins: [],
} satisfies Config;

