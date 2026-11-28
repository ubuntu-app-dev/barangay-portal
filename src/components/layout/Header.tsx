import { Brand } from "@/components/logo";
import { ButtonLink, TricolorRule } from "@/components/shared";
import { ScrollProgress } from "@/components/motion";
import MobileNav from "./MobileNav";
import PrimaryNav from "./PrimaryNav";
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
      <header className="sticky top-0 z-40 border-b border-rule bg-panel/90 backdrop-blur">
        <div className={`${container} flex items-center justify-between gap-4 py-3`}>
          <Brand />
          <PrimaryNav links={navLinks} />
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <ButtonLink href={ROUTES.login}>Login to Portal</ButtonLink>
            </span>
            <MobileNav links={navLinks} />
          </div>
        </div>
        <ScrollProgress />
      </header>
    </>
  );
}
