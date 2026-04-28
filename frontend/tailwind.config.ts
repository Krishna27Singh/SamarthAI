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
        // Global palette
        slate: {
          50: "#F8FAFC",
          500: "#64748B",
          800: "#1E293B",
          900: "#0F172A",
        },
        indigo: {
          500: "#4F46E5",
          600: "#4338CA",
        },
        emerald: {
          500: "#10B981",
        },
        amber: {
          400: "#F59E0B",
        },
        crimson: {
          500: "#EF4444",
        },
        // Legacy support
        border: "#E2E8F0",
        input: "#FFFFFF",
        ring: "#4F46E5",
        background: "#F8FAFC",
        foreground: "#1E293B",
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
          hover: "#4338CA",
        },
        secondary: {
          DEFAULT: "#64748B",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E2E8F0",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#4F46E5",
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
          DEFAULT: "#F59E0B",
          foreground: "#1E293B",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT: "#0F172A",
          foreground: "#F8FAFC",
          primary: "#4F46E5",
          "primary-foreground": "#FFFFFF",
          accent: "#1E293B",
          "accent-foreground": "#F8FAFC",
          border: "#1E293B",
          ring: "#4F46E5",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
      transitionDuration: {
        DEFAULT: "0.2s",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
