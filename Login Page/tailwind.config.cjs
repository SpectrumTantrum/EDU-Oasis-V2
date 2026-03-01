/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "oasis-bg": "#04060d",
        "oasis-glass": "rgba(8, 12, 20, 0.72)",
        "oasis-accent": "#5ef0ff",
        "oasis-accent-strong": "#7df7c6",
        "oasis-border": "#99e6ff",
        "oasis-text": "#e8f6ff",
        "oasis-muted": "#b6c4d6",
        "oasis-error": "#ff6b6b",
        "oasis-warning": "#ffd166"
      },
      boxShadow: {
        glow: "0 12px 40px rgba(0, 217, 255, 0.16)"
      },
      borderRadius: {
        pixel: "8px"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 }
        }
      },
      animation: {
        float: "float 2s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

