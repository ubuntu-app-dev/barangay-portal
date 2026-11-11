import { DrawPath } from "@/components/motion";
import IconFrame from "./IconFrame";

export default function BarangayIcon() {
  return (
    <IconFrame>
      <DrawPath d="M3 11l9-7 9 7" delay={0.0} />
      <DrawPath d="M5 10v10h14V10" delay={0.2} />
      <DrawPath d="M10 20v-6h4v6" delay={0.4} />
    </IconFrame>
  );
}
