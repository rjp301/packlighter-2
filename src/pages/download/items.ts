import type { APIRoute } from "astro";
import { Item } from "@/db/schema";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { stringify } from "csv/sync";
import { createDb } from "@/db";

export const GET: APIRoute = async ({ locals }) => {
  const db = createDb(locals.env);
  const userId = locals.user?.id;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const items = await db
    .select({
      Name: Item.name,
      Description: Item.description,
      Weight: Item.weight,
      "Weight Unit": Item.weightUnit,
      "Image Url": Item.image,
    })
    .from(Item)
    .where(eq(Item.userId, userId))
    .orderBy(desc(Item.name));

  const filename = `LighterTravel Gear - ${new Date().toLocaleString()}.csv`;
  const csv = stringify(items, { header: true });

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv",
    },
  });
};
