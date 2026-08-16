import type { APIRoute } from "astro";

export const GET: APIRoute = async (ctx) => {
  if (!ctx.locals.user) return new Response("Unauthorized", { status: 401 });

  const path = new URL(ctx.request.url).pathname
    .replace("/media/", "")
    .replace(".jpg", "");
  const file = await ctx.locals.env.R2_BUCKET.get(path);

  if (!file) return new Response("Could not find file", { status: 404 });

  return new Response(file.body, {
    headers: { "Content-Type": file.httpMetadata?.contentType ?? "" },
  });
};
