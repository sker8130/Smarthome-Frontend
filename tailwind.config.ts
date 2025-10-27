import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6c4fe0",
        accent: "#00c9d8",
      },
      boxShadow: {
        card: "0 2px 6px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
