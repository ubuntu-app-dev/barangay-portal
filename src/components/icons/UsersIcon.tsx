import { DrawPath } from "@/components/motion";
import IconFrame from "./IconFrame";

export default function UsersIcon() {
  return (
    <IconFrame>
      <DrawPath d="M4 6h16v12H4z" delay={0.0} />
      <DrawPath d="M9 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" delay={0.2} />
      <DrawPath d="M6.5 16c.4-1.4 1.4-2 2.5-2s2.1.6 2.5 2" delay={0.4} />
      <DrawPath d="M14 10h4M14 14h4" delay={0.6} />
    </IconFrame>
  );
}
