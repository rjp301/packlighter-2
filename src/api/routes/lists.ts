import { z } from "zod";
import { Hono } from "hono";
import authMiddleware from "../helpers/auth-middleware.ts";
import { zValidator } from "@hono/zod-validator";
import { List, db, eq, and, max } from "astro:db";
import { idAndUserIdFilter, validIdSchema } from "../lib/validators";
import { generateId } from "../helpers/generate-id";
import { zListCategories } from "db/schema";
import type { ExpandedList } from "db/types";

const listUpdateSchema = z.custom<Partial<typeof List.$inferInsert>>();
const listIdValidator = zValidator(
  "param",
  z.object({ listId: validIdSchema(List) }),
);

const lists = new Hono()
  .use(authMiddleware)
  .get("/", async (c) => {
    const userId = c.get("user").id;
    const lists = await db
      .select()
      .from(List)
      .where(eq(List.userId, userId))
      .orderBy(List.sortOrder);
    return c.json(lists);
  })
  .post("/", async (c) => {
    const userId = c.get("user").id;

    const { max: maxSortOrder } = await db
      .select({ max: max(List.sortOrder) })
      .from(List)
      .where(eq(List.userId, userId))
      .then((rows) => rows[0]);

    const newList = await db
      .insert(List)
      .values({
        id: generateId(),
        userId,
        sortOrder: maxSortOrder ? maxSortOrder + 1 : undefined,
      })
      .returning()
      .then((rows) => rows[0]);
    return c.json(newList);
  })
  .put("/reorder", zValidator("json", z.array(z.string())), async (c) => {
    const userId = c.get("user").id;
    const ids = c.req.valid("json");
    await Promise.all(
      ids.map((id, idx) =>
        db
          .update(List)
          .set({ sortOrder: idx + 1 })
          .where(idAndUserIdFilter(List, { userId, id })),
      ),
    );
    return c.json(ids);
  });

const list = new Hono()
  .use(authMiddleware)
  .get("/", listIdValidator, async (c) => {
    const { listId } = c.req.valid("param");
    const userId = c.get("user").id;

    const list = await db
      .select()
      .from(List)
      .where(and(eq(List.id, listId), eq(List.userId, userId)))
      .then((rows) => rows[0]);

    if (!list) {
      return c.json({ error: "List not found" }, 404);
    }

    const categories = zListCategories.parse(list.categories);
    const result: ExpandedList = { ...list, categories };
    return c.json(result);
  })
  .patch(
    "/",
    listIdValidator,
    zValidator("json", listUpdateSchema),
    async (c) => {
      const userId = c.get("user").id;
      const { listId } = c.req.valid("param");
      const value = c.req.valid("json");
      const updated = await db
        .update(List)
        .set(value)
        .where(idAndUserIdFilter(List, { userId, id: listId }))
        .returning()
        .then((rows) => rows[0]);
      return c.json(updated);
    },
  )
  .delete("/", listIdValidator, async (c) => {
    const userId = c.get("user").id;
    const { listId } = c.req.valid("param");
    await db
      .delete(List)
      .where(idAndUserIdFilter(List, { userId, id: listId }))
      .returning()
      .then((rows) => rows[0]);
    return c.json({ success: true });
  });

export const listRoutes = new Hono().route("/", lists).route("/:listId", list);
