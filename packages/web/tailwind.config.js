/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        explorer: {
          bg: "#ffffff", // surface-container-lowest
          sidebar: "#f4f3f3", // surface-container-low
          card: "#ffffff",
          active: "#004f96", // primary
          text: "#1a1c1c", // on-surface
          muted: "#5d5f5f", // secondary
          border: "#e2e2e2" // surface-container-highest
        },
        "on-error": "#ffffff",
        "surface-container-highest": "#e2e2e2",
        "error": "#ba1a1a",
        "on-error-container": "#93000a",
        "tertiary-container": "#666767",
        "tertiary": "#4d4f4f",
        "on-surface": "#1a1c1c",
        "secondary-container": "#dcdddd",
        "on-tertiary-fixed": "#1a1c1c",
        "surface-bright": "#f9f9f9",
        "primary-fixed-dim": "#a6c8ff",
        "on-tertiary-fixed-variant": "#454747",
        "inverse-primary": "#a6c8ff",
        "on-tertiary-container": "#e6e6e6",
        "surface-container-high": "#e8e8e8",
        "on-primary-container": "#dbe7ff",
        "tertiary-fixed-dim": "#c6c6c7",
        "secondary-fixed": "#e2e2e2",
        "outline": "#717783",
        "secondary-fixed-dim": "#c6c6c7",
        "on-secondary-fixed-variant": "#454747",
        "tertiary-fixed": "#e2e2e2",
        "inverse-on-surface": "#f1f1f1",
        "on-tertiary": "#ffffff",
        "surface-dim": "#dadada",
        "background": "#f9f9f9",
        "surface": "#f9f9f9",
        "error-container": "#ffdad6",
        "primary": "#004f96",
        "secondary": "#5d5f5f",
        "on-background": "#1a1c1c",
        "primary-fixed": "#d5e3ff",
        "surface-container-low": "#f4f3f3",
        "surface-container": "#eeeeee",
        "primary-container": "#0067c0",
        "on-surface-variant": "#414752",
        "outline-variant": "#c1c6d4",
        "surface-variant": "#e2e2e2",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-secondary-container": "#5f6161",
        "surface-tint": "#005eb1",
        "inverse-surface": "#2f3131",
        "on-primary-fixed-variant": "#004787",
        "on-primary-fixed": "#001c3b",
        "on-secondary-fixed": "#1a1c1c"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "address-bar-height": "32px",
        "sidebar-width": "240px",
        "gutter-md": "16px",
        "gutter-xs": "4px",
        "margin-page": "24px",
        "toolbar-height": "48px",
        "gutter-sm": "8px"
      }
    }
  },
  plugins: []
};
