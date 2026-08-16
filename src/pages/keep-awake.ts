import type { APIRoute } from "astro";
import { createDb } from "@/db";
import { User } from "@/db/schema";
import { count } from "drizzle-orm";

export const GET: APIRoute = async ({ locals }) => {
  const db = createDb(locals.env);
  const numUsers = await db
    .select({ count: count() })
    .from(User)
    .then((rows) => rows[0].count);
  return new Response(`There are ${numUsers} users in the database.`);
};
