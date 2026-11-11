import { DrawPath } from "@/components/motion";
import IconFrame from "./IconFrame";

export default function ReportIcon() {
  return (
    <IconFrame>
      <DrawPath d="M4 20h16" delay={0.0} />
      <DrawPath d="M7 20v-6M12 20V8M17 20v-9" delay={0.2} />
      <DrawPath d="M5 9l4-3 3 2 6-5" delay={0.4} />
    </IconFrame>
  );
}
