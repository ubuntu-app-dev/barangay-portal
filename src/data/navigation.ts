import { SECTIONS } from "@/lib/routes";
import type { NavLink } from "@/types/landing";

export const navLinks: NavLink[] = [
  { label: "Home", href: SECTIONS.home },
  { label: "About the System", href: SECTIONS.about },
  { label: "Features", href: SECTIONS.features },
  { label: "How It Works", href: SECTIONS.how },
  { label: "Contact", href: SECTIONS.contact },
];
