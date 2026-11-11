import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  variant?: "primary" | "secondary" | "gold";
  children: ReactNode;
};

export default function ButtonLink({
  href,
  variant = "primary",
  children,
}: Props) {
  return (
    <Link href={href} className={`btn btn-${variant}`}>
      {children}
    </Link>
  );
}

// import Link from "next/link";
// import type { ReactNode } from "react";

// type Props = {
//   href: string;
//   variant?: "primary" | "secondary" | "outline";
//   children: ReactNode;
// };

// export default function ButtonLink({
//   href,
//   variant = "primary",
//   children,
// }: Props) {
//   return (
//     <Link href={href} className={`btn btn-${variant}`}>
//       {children}
//     </Link>
//   );
// }
