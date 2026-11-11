import Link from "next/link";
import Logo from "./logo";
import { brand } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";

export default function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href={ROUTES.home}
      className="flex items-center gap-3"
      aria-label={`${brand.name} home`}
    >
      <Logo />
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold tracking-[-0.02em]">
          {brand.name}
        </span>
        <span
          className={`hidden text-[13px] sm:block ${onDark ? "text-on-field-secondary" : "text-ink-secondary"}`}
        >
          {brand.subtitle}
        </span>
      </span>
    </Link>
  );
}
