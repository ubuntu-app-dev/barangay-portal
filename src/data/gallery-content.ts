export type GalleryImage = { src: string; alt: string };

/** True while the images are illustrations. Set to false once they are real screenshots. */
export const galleryIsIllustrative = true;

export const galleryHeading = {
  title: "See the platform at work",
  text: "A look at the screens each user level works in, from the barangay hall to the municipal hall.",
  note: "Illustrations of key screens in the platform.",
};

export const galleryItems: GalleryImage[] = [
  { src: "/gallery/resident-records.svg", alt: "Resident Records screen" },
  {
    src: "/gallery/barangay-clearance.svg",
    alt: "Barangay Clearance being issued",
  },
  { src: "/gallery/incident-records.svg", alt: "Incident Records screen" },
  {
    src: "/gallery/municipal-review.svg",
    alt: "Municipal Review screen with verified and submitted barangay reports",
  },
  { src: "/gallery/reports.svg", alt: "Reports screen with a bar chart" },
  {
    src: "/gallery/accounts-and-roles.svg",
    alt: "Accounts and Roles screen for the Superadmin",
  },
];
