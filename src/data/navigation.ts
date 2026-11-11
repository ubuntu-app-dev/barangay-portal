import { SECTIONS } from "@/lib/routes";
import type { NavLink } from "@/types/landing";

export const navLinks: NavLink[] = [
  { label: "Systems", href: SECTIONS.systems },
  { label: "User levels", href: SECTIONS.levels },
  { label: "Gallery", href: SECTIONS.gallery },
  { label: "How it works", href: SECTIONS.how },
  { label: "Data privacy", href: SECTIONS.privacy },
];
