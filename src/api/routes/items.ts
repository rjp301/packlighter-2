import { z } from "zod";
import { Hono } from "hono";
import authMiddleware from "../helpers/auth-middleware.ts";
import { zValidator } from "@hono/zod-validator";
import { Item, db, eq } from "astro:db";
import { idAndUserIdFilter, validIdSchema } from "../lib/validators";

const itemUpdateSchema = z.custom<Partial<typeof Item.$inferInsert>>();
const itemIdValidator = zValidator(
  "param",
  z.object({ itemId: validIdSchema(Item) }),
);

export const itemRoutes = new Hono()
  .use(authMiddleware)
  .get("/", async (c) => {
    const userId = c.get("user").id;
    const items = await db.select().from(Item).where(eq(Item.userId, userId));
    return c.json(items);
  })
  .delete("/:itemId", itemIdValidator, async (c) => {
    const userId = c.get("user").id;
    const { itemId } = c.req.valid("param");
    await db
      .delete(Item)
      .where(idAndUserIdFilter(Item, { userId, id: itemId }));
    return c.json({ success: true });
  })
  .patch(
    "/:itemId",
    itemIdValidator,
    zValidator("json", itemUpdateSchema),
    async (c) => {
      const userId = c.get("user").id;
      const { itemId } = c.req.valid("param");
      const value = c.req.valid("json");
      const updated = await db
        .update(Item)
        .set(value)
        .where(idAndUserIdFilter(Item, { userId, id: itemId }))
        .returning()
        .then((rows) => rows[0]);
      return c.json(updated);
    },
  );
