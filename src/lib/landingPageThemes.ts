export const LANDING_PAGE_THEMES = {
  violet: { label: "Violet", primary: "#7c3aed", primaryForeground: "#ffffff" },
  blue: { label: "Blue", primary: "#2563eb", primaryForeground: "#ffffff" },
  emerald: { label: "Emerald", primary: "#059669", primaryForeground: "#ffffff" },
  rose: { label: "Rose", primary: "#e11d48", primaryForeground: "#ffffff" },
  amber: { label: "Amber", primary: "#d97706", primaryForeground: "#ffffff" },
  slate: { label: "Slate", primary: "#334155", primaryForeground: "#ffffff" },
} as const;

export type LandingPageThemeKey = keyof typeof LANDING_PAGE_THEMES;

export const DEFAULT_LANDING_PAGE_THEME: LandingPageThemeKey = "violet";
