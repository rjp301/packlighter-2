import setUserSession from "@/lib/auth/set-user-session";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {



  await setUserSession(context, "guest");
  return context.redirect("/");
}
