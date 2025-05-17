
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
        nunito: ['Nunito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Aliança Fiscal colors
        "af-blue": {
          50: "#f0f3ff",
          100: "#e2e8ff",
          200: "#c9d4fe",
          300: "#a7b6fc",
          400: "#8090f8",
          500: "#6b74f1",
          600: "#5466DD", // Main blue
          700: "#3f43c8",
          800: "#3639a3",
          900: "#303381",
        },
        "af-green": {
          50: "#ebfef4",
          100: "#d0fce5",
          200: "#a5f8ce",
          300: "#70efb0",
          400: "#36e089",
          500: "#00CC88", // Main green
          600: "#0da56b",
          700: "#108254",
          800: "#146544",
          900: "#13533a",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "var(--progress-value)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { 
            transform: "translateY(10px)",
            opacity: "0"
          },
          to: { 
            transform: "translateY(0)",
            opacity: "1"
          }
        },
        "pulse": {
          "0%, 100%": { 
            opacity: "1" 
          },
          "50%": { 
            opacity: "0.7" 
          }
        },
        "scale-in": {
          from: { 
            transform: "scale(0.95)",
            opacity: "0"
          },
          to: { 
            transform: "scale(1)",
            opacity: "1"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "progress-fill": "progress-fill 1s ease-in-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
