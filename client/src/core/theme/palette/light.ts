import type { PaletteOptions } from "@mui/material/styles";

// Measured WCAG ratios drive these values. See _docs/design/nav-shell-neutral-console.html.
export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    // #67be23 with white text measures 2.34:1 and fails. #3f7d0f measures 5.06:1.
    // The brand green stays available as primary.light for the logo mark and dots.
    main: "#3f7d0f",
    light: "#67be23",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#2A132E",
    contrastText: "#fff",
  },
  background: {
    default: "#f6f7f9",
    paper: "#ffffff",
  },
  success: {
    main: "#3f7d0f",
    light: "#67be23",
    contrastText: "#ffffff",
  },
  error: {
    main: "#fa541c",
    contrastText: "#fff",
  },
  warning: {
    // #fa8c16 as text on white measures 2.4:1. #b54708 measures 5.43:1.
    main: "#b54708",
    light: "#fa8c16",
    contrastText: "#ffffff",
  },
  info: {
    main: "#0b82f0",
    contrastText: "#fff",
  },
  // Card borders read `divider`. The previous transparent value hid every border.
  divider: "#e3e6ea",
  text: {
    primary: "#14181f",
    // #9f9f9f measures 2.65:1 on white. #667085 measures 4.97:1.
    secondary: "#667085",
    disabled: "#c1c1c1",
  },
};
