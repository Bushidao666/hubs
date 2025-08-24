import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundColor: {
        'glass': 'rgba(0, 0, 0, 0.4)',
        'glass-hover': 'rgba(0, 0, 0, 0.5)',
      },
      borderColor: {
        'subtle': 'rgba(255, 255, 255, 0.1)',
        'subtle-hover': 'rgba(255, 255, 255, 0.15)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "monospace"],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
      },
      keyframes: {
        glow: {
          'from': { 
            'box-shadow': '0 0 10px rgba(0, 255, 0, 0.2)',
          },
          'to': { 
            'box-shadow': '0 0 20px rgba(0, 255, 0, 0.3)',
          }
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            'box-shadow': '0 0 15px rgba(0, 255, 0, 0.3)',
          },
          '50%': {
            opacity: '0.9',
            'box-shadow': '0 0 25px rgba(0, 255, 0, 0.4)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gridMove: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(30px) translateY(30px)' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "modern-dark",
      themes: {
        "modern-dark": {
          extend: "dark",
          colors: {
            background: "#0a0a0a",
            foreground: "#fafafa",
            divider: "rgba(255, 255, 255, 0.08)",
            overlay: "rgba(0, 0, 0, 0.5)",
            focus: "#00ff00",
            content1: "#171717",
            content2: "#262626",
            content3: "#404040",
            content4: "#525252",
            
            default: {
              50: "#fafafa",
              100: "#f4f4f5",
              200: "#e4e4e7",
              300: "#d4d4d8",
              400: "#a1a1aa",
              500: "#71717a",
              600: "#52525b",
              700: "#3f3f46",
              800: "#27272a",
              900: "#18181b",
              DEFAULT: "#3f3f46",
              foreground: "#fafafa",
            },
            
            primary: {
              50: "#e6ffe6",
              100: "#ccffcc",
              200: "#99ff99",
              300: "#66ff66",
              400: "#33ff33",
              500: "#00ff00",
              600: "#00dd00",
              700: "#00bb00",
              800: "#009900",
              900: "#007700",
              DEFAULT: "#00ff00",
              foreground: "#000000",
            },
            
            secondary: {
              50: "#f0f9ff",
              100: "#e0f2fe",
              200: "#bae6fd",
              300: "#7dd3fc",
              400: "#38bdf8",
              500: "#0ea5e9",
              600: "#0284c7",
              700: "#0369a1",
              800: "#075985",
              900: "#0c4a6e",
              DEFAULT: "#0ea5e9",
              foreground: "#ffffff",
            },
            
            success: {
              DEFAULT: "#00ff00",
              foreground: "#000000",
            },
            
            warning: {
              DEFAULT: "#f59e0b",
              foreground: "#ffffff",
            },
            
            danger: {
              DEFAULT: "#ef4444",
              foreground: "#ffffff",
            },
          },
          layout: {
            radius: {
              small: "8px",
              medium: "12px",
              large: "16px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
      },
    }),
  ],
}

module.exports = config;