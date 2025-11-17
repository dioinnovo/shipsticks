import type { Config } from 'tailwindcss'
const defaultTheme = require('tailwindcss/defaultTheme')

const config: Config = {
  darkMode: "class",
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'tablet': '820px', // iPad Mini
    },
    extend: {
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
        // Ship Sticks Brand Colors - Golf & Travel Focus
        arthur: {
          // Primary Brand Colors (Main CTAs, Headers, Key Elements)
          blue: "#5fd063", // Ship Sticks Primary Green (keeping 'blue' for compatibility)
          "blue-hover": "#4fab55", // Darker Green for hover states
          "blue-light": "#7FE083", // Secondary Light Green
          "blue-lighter": "#E6F9E7", // Light Green Background

          // UI Foundation Colors (Primary Usage)
          "ui-primary": "#5fd063", // Primary Green - main buttons, headers
          gray: "#707070", // Professional Gray - secondary actions
          "gray-dark": "#231f20", // Ship Sticks Navy Text
          "gray-light": "#F5F5F5", // Light Gray Background

          // Gray Scale (Professional Golf Brand)
          "gray-900": "#231f20", // Ship Sticks Navy
          "gray-800": "#2B2B2B",
          "gray-700": "#404040",
          "gray-600": "#525252",
          "gray-500": "#707070",
          "gray-400": "#A0A0A0",
          "gray-300": "#D0D0D0",
          "gray-200": "#E0E0E0",
          "gray-100": "#F5F5F5",
          "gray-50": "#F9FAFB",

          // Semantic Colors (Shipping/Travel Context)
          success: "#5fd063", // Green for successful deliveries
          warning: "#F59E0B", // Amber for shipping alerts
          error: "#DC2626", // Red for delivery issues
          info: "#5fd063", // Green for information
          care: "#4fab55", // Accent green for quality service
          risk: "#FF9800" // Orange for priority indicators
        },
        // Legacy SCC mapping for compatibility
        scc: {
          red: "#5fd063", // Maps to Ship Sticks green
          "red-hover": "#4fab55", // Maps to Ship Sticks green hover
          gray: "#707070",
          "gray-dark": "#231f20", // Ship Sticks Navy
          "gray-light": "#F5F5F5",
          success: "#5fd063",
          warning: "#F59E0B",
          error: "#DC2626",
          info: "#5fd063"
        },
      },
      fontFamily: {
        sans: ['Lato', 'Roboto', ...defaultTheme.fontFamily.sans],
        heading: ['Lato', ...defaultTheme.fontFamily.sans],
        body: ['Roboto', ...defaultTheme.fontFamily.sans],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config