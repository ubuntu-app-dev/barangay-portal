export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
} as const;

/** Section anchors on the landing page. Each id must match a section's `id`. */
export const SECTIONS = {
  home: "#home",
  about: "#about",
  features: "#features",
  explore: "#explore",
  how: "#how",
  security: "#security",
  contact: "#contact",
} as const;
