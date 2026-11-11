import { DrawPath } from "@/components/motion";
import IconFrame from "./IconFrame";

export default function DocumentIcon() {
  return (
    <IconFrame>
      <DrawPath d="M7 3h7l4 4v14H7z" delay={0.0} />
      <DrawPath d="M14 3v4h4" delay={0.2} />
      <DrawPath d="M10 12h5M10 16h5" delay={0.4} />
    </IconFrame>
  );
}
