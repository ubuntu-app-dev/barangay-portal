import { DrawPath } from "@/components/motion";
import IconFrame from "./IconFrame";

export default function MunicipalityIcon() {
  return (
    <IconFrame>
      <DrawPath d="M3 9l9-5 9 5z" delay={0.0} />
      <DrawPath d="M6 11v7M10 11v7M14 11v7M18 11v7" delay={0.2} />
      <DrawPath d="M4 20h16" delay={0.4} />
    </IconFrame>
  );
}
