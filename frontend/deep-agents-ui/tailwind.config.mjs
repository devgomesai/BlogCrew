import { blackA, green, mauve, slate, violet } from "@radix-ui/colors";
import plugin from "tailwindcss/plugin";
import containerQueries from "@tailwindcss/container-queries";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import tailwindcssAnimate from "tailwindcss-animate";
import headlessui from "@headlessui/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-joy-color-scheme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: [`var(--font-outfit)`, `"Outfit"`, `ui-sans-serif`, `system-ui`, `sans-serif`],
        mono: [
          `"SF Mono"`, `Monaco`, `"Cascadia Code"`, `"Roboto Mono"`,
          `Consolas`, `"Courier New"`, `monospace`,
        ],
      },
      fontSize: {
        xxs: ["0.75rem", { lineHeight: "1.125rem" }],
        xs: ["0.8125rem", { lineHeight: "1.125rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.875rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.375rem" }],
        "3xl": ["1.875rem", { lineHeight: "1.125" }],
        "4xl": ["2.25rem", { lineHeight: "1" }],
        "5xl": ["3rem", { lineHeight: "0.95" }],
        "6xl": ["3.75rem", { lineHeight: "0.9" }],
        "7xl": ["4.5rem", { lineHeight: "0.9" }],
        "8xl": ["6rem", { lineHeight: "0.85" }],
        "9xl": ["8rem", { lineHeight: "0.85" }],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.03em",
        snug: "-0.02em",
        normal: "0",
        wide: "0.03em",
        wider: "0.06em",
        widest: "0.1em",
      },
      lineHeight: {
        tight: "1.20",
        tighter: "1.10",
        none: "1",
      },
      borderRadius: {
        none: "0",
        full: "9999px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "3px",
      },
      borderWidth: {
        DEFAULT: "2px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
      },
      boxShadow: {
        "hard-xs": "2px 2px 0px 0px #121212",
        "hard-sm": "3px 3px 0px 0px #121212",
        "hard": "4px 4px 0px 0px #121212",
        "hard-md": "6px 6px 0px 0px #121212",
        "hard-lg": "8px 8px 0px 0px #121212",
        "hard-blue": "4px 4px 0px 0px #1040C0",
        "hard-red": "4px 4px 0px 0px #D02020",
        "hard-yellow": "4px 4px 0px 0px #F0C020",
      },
      dropShadow: {
        hard: "3px 3px 0px rgba(0,0,0,1)",
      },
      backgroundColor: {
        primary: "var(--bg-primary)",
        "primary-hover": "var(--bg-primary_hover)",
        secondary: "var(--bg-secondary)",
        "secondary-hover": "var(--bg-secondary_hover)",
        tertiary: "var(--bg-tertiary)",
        quaternary: "var(--bg-quaternary)",
        "brand-primary": "var(--bg-brand-primary)",
        "brand-primary-hover": "var(--bg-brand-primary_hover)",
        "brand-secondary": "var(--bg-brand-secondary)",
        "brand-tertiary": "var(--bg-brand-tertiary)",
        purple: "var(--bg-purple)",
        "success-primary": "var(--bg-success-primary)",
        "success-secondary": "var(--bg-success-secondary)",
        "success-strong": "var(--bg-success-strong)",
        "error-primary": "var(--bg-error-primary)",
        "error-secondary": "var(--bg-error-secondary)",
        "error-strong": "var(--bg-error-strong)",
        "error-strong-hover": "var(--bg-error-strong-hover)",
        "warning-primary": "var(--bg-warning-primary)",
        "warning-secondary": "var(--bg-warning-secondary)",
        "warning-strong": "var(--bg-warning-strong)",
      },
      borderColor: {
        primary: "var(--border-primary)",
        secondary: "var(--border-secondary)",
        tertiary: "var(--border-tertiary)",
        error: "var(--border-error)",
        "error-strong": "var(--border-error-strong)",
        brand: "var(--border-brand)",
        "brand-strong": "var(--border-brand-strong)",
        "brand-subtle": "var(--border-brand-subtle)",
        strong: "var(--border-strong)",
        warning: "var(--border-warning)",
        success: "var(--border-success)",
        purple: "var(--border-purple)",
        "status-green": "var(--border-status-green)",
        "status-orange": "var(--border-status-orange)",
        "status-yellow": "var(--border-status-yellow)",
        "status-red": "var(--border-status-red)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        quaternary: "var(--text-quaternary)",
        disabled: "var(--text-disabled)",
        error: "var(--text-error)",
        warning: "var(--text-warning)",
        success: "var(--text-success)",
        placeholder: "var(--text-placeholder)",
        purple: "var(--text-purple)",
        "brand-primary": "var(--text-brand-primary)",
        "brand-secondary": "var(--text-brand-secondary)",
        "brand-tertiary": "var(--text-brand-tertiary)",
        "brand-disabled": "var(--text-brand-disabled)",
        "status-green": "var(--text-status-green)",
        "status-orange": "var(--text-status-orange)",
        "status-yellow": "var(--text-status-yellow)",
        "status-red": "var(--text-status-red)",
        "button-primary": "var(--text-button-primary)",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        bauhaus: {
          red: "#D02020",
          blue: "#1040C0",
          yellow: "#F0C020",
          black: "#121212",
          white: "#F0F0F0",
        },
      },
      keyframes: {
        hide: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        slideIn: {
          from: { transform: "translateX(calc(100% + var(--viewport-padding)))" },
          to: { transform: "translateX(0)" },
        },
        swipeOut: {
          from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
          to: { transform: "translateX(calc(100% + var(--viewport-padding)))" },
        },
      },
      animation: {
        hide: "hide 100ms ease-in",
        slideIn: "slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        swipeOut: "swipeOut 100ms ease-out",
      },
    },
  },
  plugins: [
    containerQueries,
    typography,
    forms,
    tailwindcssAnimate,
    headlessui,
    plugin(({ addUtilities, addBase }) => {
      addBase({
        input: { borderWidth: "0", padding: "0" },
        "html, body, *": {
          "scrollbar-width": "thin",
          "scrollbar-color": "var(--scrollbar-thumb) var(--bg-primary)",
        },
        "html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar":
          { width: "8px", background: "var(--bg-primary)" },
        "html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, *::-webkit-scrollbar-track":
          { background: "var(--bg-primary)" },
        "html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-track, *::-webkit-scrollbar-thumb":
          { background: "var(--scrollbar-thumb)", "border-radius": "4px" },
        "html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover":
          { background: "var(--scrollbar-thumb-hover)" },
      });
      addUtilities({
        ".no-scrollbar": {
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".break-anywhere": {
          "@supports (overflow-wrap: anywhere)": { "overflow-wrap": "anywhere" },
          "@supports not (overflow-wrap: anywhere)": { "word-break": "break-word" },
        },
        ".no-number-spinner": {
          MozAppearance: "textfield",
          "&::-webkit-outer-spin-button": { WebkitAppearance: "none !important", margin: 0 },
          "&::-webkit-inner-spin-button": { WebkitAppearance: "none !important", margin: 0 },
        },
        ".text-security": {
          textSecurity: "disc",
          WebkitTextSecurity: "disc",
          MozTextSecurity: "disc",
        },
      });
    }),
  ],
};
