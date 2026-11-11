import { Brand } from "@/components/logo";
import { ButtonLink, TricolorRule } from "@/components/shared";
import MobileNav from "./MobileNav";
import { container } from "@/lib/styles";
import { navLinks } from "@/data/navigation";
import { ROUTES } from "@/lib/routes";

export default function Header() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <TricolorRule />
      <header className="sticky top-0 z-40 border-b border-rule bg-panel/95 backdrop-blur">
        <div
          className={`${container} flex items-center justify-between gap-4 py-3`}
        >
          <Brand />
          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 text-[15px] text-ink-secondary md:flex"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-ink hover:underline"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href={ROUTES.login}>Sign in</ButtonLink>
            <MobileNav links={navLinks} />
          </div>
        </div>
      </header>
    </>
  );
}
