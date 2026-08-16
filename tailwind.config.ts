import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0E14",
        panel: "#10151D",
        panel2: "#161C26",
        line: "#232B38",
        amber: "#FFB000",
        amberdim: "#8A6300",
        cyan: "#00D4D4",
        red: "#FF4D4D",
        ink: "#D8DEE9",
        inkdim: "#6B7686",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        grot: ["Space Grotesk", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(255,176,0,0.35)",
        glowcyan: "0 0 12px rgba(0,212,212,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
