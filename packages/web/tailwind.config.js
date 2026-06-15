/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        explorer: {
          bg: "#f9f9f9", // surface
          sidebar: "#f3f3f4", // surface-container-low
          card: "#ffffff",
          active: "#0078d4", // primary-container / overridePrimaryColor
          text: "#1a1c1c", // on-surface
          muted: "#5d5f5f", // secondary
          border: "#c0c7d4" // outline-variant
        },
        "on-error": "#ffffff",
        "surface-container-highest": "#e2e2e2",
        error: "#ba1a1a",
        "on-error-container": "#93000a",
        "tertiary-container": "#bc5b00",
        tertiary: "#974700",
        "on-surface": "#1a1c1c",
        "secondary-container": "#dcdddd",
        "on-tertiary-fixed": "#311300",
        "surface-bright": "#f9f9f9",
        "primary-fixed-dim": "#a3c9ff",
        "on-tertiary-fixed-variant": "#743500",
        "inverse-primary": "#a3c9ff",
        "on-tertiary-container": "#ffffff",
        "surface-container-high": "#e8e8e8",
        "on-primary-container": "#ffffff",
        "tertiary-fixed-dim": "#ffb689",
        "secondary-fixed": "#e2e2e2",
        outline: "#717783",
        "secondary-fixed-dim": "#c6c6c7",
        "on-secondary-fixed-variant": "#454747",
        "tertiary-fixed": "#ffdbc8",
        "inverse-on-surface": "#f0f1f1",
        "on-tertiary": "#ffffff",
        "surface-dim": "#dadada",
        background: "#f9f9f9",
        surface: "#f9f9f9",
        "error-container": "#ffdad6",
        primary: "#005faa",
        secondary: "#5d5f5f",
        "on-background": "#1a1c1c",
        "primary-fixed": "#d3e3ff",
        "surface-container-low": "#f3f3f4",
        "surface-container": "#eeeeee",
        "primary-container": "#0078d4",
        "on-surface-variant": "#404752",
        "outline-variant": "#c0c7d4",
        "surface-variant": "#e2e2e2",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-secondary-container": "#5f6161",
        "surface-tint": "#0060ab",
        "inverse-surface": "#2f3131",
        "on-primary-fixed-variant": "#004883",
        "on-primary-fixed": "#001c39",
        "on-secondary-fixed": "#1a1c1c"
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px"
      },
      spacing: {
        "address-bar-height": "32px",
        "sidebar-width": "280px",
        "gutter-md": "16px",
        "gutter-xs": "4px",
        "margin-page": "24px",
        "toolbar-height": "44px", // 11 in Stitch (44px)
        "command-bar-height": "48px",
        "gutter-sm": "8px"
      }
    }
  },
  plugins: []
};
