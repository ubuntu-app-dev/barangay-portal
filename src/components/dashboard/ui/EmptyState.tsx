import Icon from "./Icon";
import type { IconName } from "./icon-paths";

export default function EmptyState({ title, text, icon = "inbox" }: { title: string; text: string; icon?: IconName }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ground-muted text-ink-secondary"><Icon name={icon} className="h-6 w-6" /></span>
      <p className="font-display text-[16px] font-bold">{title}</p>
      <p className="max-w-[44ch] text-[14px] text-ink-secondary">{text}</p>
    </div>
  );
}
