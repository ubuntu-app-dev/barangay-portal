import { DrawPath } from "@/components/motion";
import IconFrame from "./IconFrame";

export default function ResidentsIcon() {
  return (
    <IconFrame>
      <DrawPath d="M12 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" delay={0.0} />
      <DrawPath d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" delay={0.2} />
    </IconFrame>
  );
}
