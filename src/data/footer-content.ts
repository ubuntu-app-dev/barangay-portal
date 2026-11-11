import { ROUTES, SECTIONS } from "@/lib/routes";

export const footerContent = {
  blurb:
    "One centralized platform connecting the Barangay Information System and the Municipal System.",
  groups: [
    {
      title: "Platform",
      links: [
        { label: "Systems", href: SECTIONS.systems },
        { label: "Gallery", href: SECTIONS.gallery },
        { label: "How it works", href: SECTIONS.how },
        { label: "Data privacy", href: SECTIONS.privacy },
      ],
    },
    {
      title: "Access",
      links: [
        { label: "User levels", href: SECTIONS.levels },
        { label: "Sign in", href: ROUTES.login },
      ],
    },
  ],
};
