import { ROUTES } from "@/lib/routes";
import { getAuthUser, ROLE_HOME } from "@/server/auth";

/** Where the installed app opens: the user's own workspace if signed in, otherwise the sign-in page. */
export async function GET(request: Request) {
  const u = await getAuthUser();
  return Response.redirect(new URL(u ? ROLE_HOME[u.role] : ROUTES.login, request.url), 307);
}
