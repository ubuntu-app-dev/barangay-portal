import { redirect } from "next/navigation";
import { routes } from "@/config/navigation";

export default function BarangayProfileIndex() {
  redirect(routes.profile);
}
