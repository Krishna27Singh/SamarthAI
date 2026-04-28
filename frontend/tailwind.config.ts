import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // Serene Relief palette
        "alice-blue": "#F0F8FF",
        "soft-beige": "#F7F5F0",
        "darker-beige": "#EBE7DD",
        "ocean-blue": "#2563EB",
        "ocean-blue-dark": "#1D4ED8",
        "light-blue-border": "#E0F2FE",
        slate: {
          300: "#CBD5E1",
          500: "#64748B",
          800: "#1E293B",
        },
        // Semantic colors
        "alert-red": "#DC2626",
        "alert-red-bg": "#FEE2E2",
        "alert-amber": "#D97706",
        "alert-amber-bg": "#FEF3C7",
        "alert-green": "#059669",
        "alert-green-bg": "#D1FAE5",
        // Legacy support
        border: "#E0F2FE",
        input: "#FFFFFF",
        ring: "#2563EB",
        background: "#F0F8FF",
        foreground: "#1E293B",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          hover: "#1D4ED8",
        },
        secondary: {
          DEFAULT: "#64748B",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E0F2FE",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#1E293B",
        },
        success: {
          DEFAULT: "#059669",
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT: "#F7F5F0",
          foreground: "#1E293B",
          primary: "#2563EB",
          "primary-foreground": "#FFFFFF",
          accent: "#EBE7DD",
          "accent-foreground": "#2563EB",
          border: "#E0F2FE",
          ring: "#2563EB",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        card: "0 4px 14px 0 rgba(0, 118, 255, 0.05)",
        "card-hover": "0 8px 20px 0 rgba(0, 118, 255, 0.12)",
        sm: "0 2px 8px 0 rgba(0, 118, 255, 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
      transitionDuration: {
        DEFAULT: "0.3s",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
