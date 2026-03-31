import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b1326",
        surface: "#0b1326",
        "surface-container-lowest": "#060e20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",
        "surface-variant": "#2d3449",
        primary: "#ffb77d",
        "primary-container": "#d97707",
        secondary: "#b9c8de",
        "secondary-container": "#39485a",
        tertiary: "#dcc66e",
        "tertiary-container": "#bfab56",
        error: "#ffb4ab",
        "error-container": "#93000a",
        outline: "#a38c7c",
        "outline-variant": "#554336",
        "on-surface": "#dae2fd",
        "on-surface-variant": "#dbc2b0",
        "on-primary-container": "#432100",
        "on-secondary-container": "#a7b6cc",
        "on-tertiary-container": "#4b3f00"
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        ambient: "0 20px 40px rgba(35, 49, 67, 0.08)"
      },
      borderRadius: {
        shell: "1.5rem"
      }
    }
  },
  plugins: []
} satisfies Config;
