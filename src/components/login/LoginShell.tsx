import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/logo";
import { TricolorRule } from "@/components/shared";
import CopyrightYear from "@/components/shared/CopyrightYear";
import { brand } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import MapProgress from "./MapProgress";

type Props = {
  headline: ReactNode;
  journey?: ReactNode;
  progress: number;
  children: ReactNode;
};

/** The two-panel layout: blue panel with the map meter on the left, the form on the right. */
export default function LoginShell({
  headline,
  journey,
  progress,
  children,
}: Props) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <TricolorRule />
      <div className="grid min-h-[calc(100dvh-6px)] lg:grid-cols-[1.05fr_1fr]">
        <aside
          data-surface="dark"
          className="brand-field relative isolate overflow-hidden px-6 py-8 text-on-field lg:px-12 lg:py-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[360px] w-[360px] rounded-full bg-flag-gold/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-[340px] w-[340px] rounded-full bg-flag-red/25 blur-3xl"
          />
          <MapProgress
            progress={progress}
            className="absolute bottom-6 right-[4%] -z-10 hidden aspect-[702/1209] h-[58%] xl:block"
          />

          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <Brand onDark />
              <Link
                href={ROUTES.home}
                className="text-[14px] text-on-field-secondary hover:text-on-field hover:underline"
              >
                <span aria-hidden="true">&larr; </span>Back to home
              </Link>
            </div>
            <div className="mt-10 lg:mt-16">{headline}</div>
            {journey && <div className="mt-10 hidden lg:block">{journey}</div>}
          </div>
        </aside>

        <main
          id="main"
          className="flex items-center justify-center bg-ground px-5 py-10 sm:px-8"
        >
          <div className="w-full max-w-[520px]">
            {children}
            <p className="mt-10 text-center text-[13px] text-ink-secondary">
              &copy; <CopyrightYear /> {brand.name}
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
