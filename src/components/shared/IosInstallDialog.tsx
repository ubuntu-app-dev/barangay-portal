"use client";
import { useEffect, useId, useRef } from "react";
import { brand } from "@/lib/brand";
import { IOS_HELP_EVENT } from "@/lib/pwa";

/**
 * "Add to Home Screen" steps for iPhone and iPad, which have no install prompt.
 * Lives in the root layout (via PwaSetup) so it stays open after the menu that opened it closes.
 */
export default function IosInstallDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const open = () => dialog.current?.showModal();
    window.addEventListener(IOS_HELP_EVENT, open);
    return () => window.removeEventListener(IOS_HELP_EVENT, open);
  }, []);
  return (
    <dialog ref={dialog} className="modal" aria-labelledby={titleId}>
      <div className="p-6">
        <h2 id={titleId} className="font-display text-[18px] font-bold tracking-[-0.01em]">
          Add {brand.name} to your Home Screen
        </h2>
        <ol className="mt-4 space-y-3 text-[15px]">
          <li className="flex gap-3">
            <Step n={1} />
            <span>
              Tap the <strong>Share</strong> button <ShareGlyph /> at the bottom (iPhone) or top (iPad) of Safari.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={3} />
            <span>
              Tap <strong>Add</strong>. {brand.name} then opens from its own icon, like an app.
            </span>
          </li>
        </ol>
        <div className="mt-6 flex justify-end">
          <button type="button" className="btn btn-primary" onClick={() => dialog.current?.close()}>
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-fill text-[13px] font-bold text-white"
    >
      {n}
    </span>
  );
}

/** Safari's share icon: a box with an arrow pointing up. */
function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="inline h-4 w-4 align-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" aria-label="(square with an up arrow)">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}
