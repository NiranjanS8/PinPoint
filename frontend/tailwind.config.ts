import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#f8f8f8",
        sidebar: "#f5f5f4",
        panel: "#ffffff",
        mutedPanel: "#f3f3f5",
        borderSoft: "#e6e7eb",
        textStrong: "#101828",
        textMuted: "#667085",
        navy: "#131522",
        accentBlue: "#3b82f6",
        accentGreen: "#22c55e",
        accentPurple: "#9333ea",
        accentOrange: "#f97316"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16, 24, 40, 0.04)",
        dialog: "0 24px 48px rgba(16, 24, 40, 0.18)"
      },
      borderRadius: {
        shell: "18px"
      },
      gridTemplateColumns: {
        app: "314px minmax(0, 1fr)"
      }
    }
  },
  plugins: []
} satisfies Config;
