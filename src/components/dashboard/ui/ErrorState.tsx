import Link from "next/link";
import Icon from "./Icon";

export default function ErrorState({ title, text, retryHref }: { title: string; text: string; retryHref?: string }) {
  return (
    <div role="alert" className="mx-auto flex max-w-[520px] flex-col items-center gap-3 rounded-xl border border-rule bg-panel px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-flag-red/10 text-flag-red"><Icon name="alert" className="h-6 w-6" /></span>
      <h1 className="font-display text-xl font-bold">{title}</h1>
      <p className="text-[15px] text-ink-secondary">{text}</p>
      {retryHref && <Link href={retryHref} className="btn btn-primary mt-2">Try again</Link>}
    </div>
  );
}
