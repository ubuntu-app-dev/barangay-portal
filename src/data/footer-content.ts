import { ROUTES, SECTIONS } from "@/lib/routes";

export const footerContent = {
  blurb:
    "A centralized platform connecting municipal offices and barangay administrations.",
  groups: [
    {
      title: "Platform",
      links: [
        { label: "About the System", href: SECTIONS.about },
        { label: "Features", href: SECTIONS.features },
        { label: "Explore the Platform", href: SECTIONS.explore },
        { label: "How It Works", href: SECTIONS.how },
        { label: "Security", href: SECTIONS.security },
      ],
    },
    {
      title: "Portal",
      links: [
        { label: "Login to Portal", href: ROUTES.login },
        { label: "Contact", href: SECTIONS.contact },
      ],
    },
  ],
};
