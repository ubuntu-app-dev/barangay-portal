import {
  ClipboardCheck,
  FolderKanban,
  House,
  KeyRound,
  Landmark,
  Megaphone,
  Network,
  Send,
  Settings2,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/types/landing";

const ICONS: Record<IconName, LucideIcon> = {
  network: Network,
  folders: FolderKanban,
  zap: Zap,
  records: Users,
  municipal: Landmark,
  megaphone: Megaphone,
  shield: ShieldCheck,
  setup: Settings2,
  secretary: House,
  send: Send,
  review: ClipboardCheck,
  key: KeyRound,
};

export function LandingIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.9} />;
}

/** Small uppercase label above a section heading. */
export function Eyebrow({
  children,
  onDark = false,
}: {
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] ${
        onDark ? "text-flag-gold" : "text-brand"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${onDark ? "bg-flag-gold" : "bg-flag-red"}`}
      />
      {children}
    </p>
  );
}
