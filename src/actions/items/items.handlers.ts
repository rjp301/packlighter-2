import { Category, CategoryItem, Item, List, ListUser } from "@/db/schema";
import { createDb } from "@/db";
import { and, eq } from "drizzle-orm";

import { ActionError } from "astro:actions";
import { isAuthorized } from "@/actions/helpers";

import * as itemInputs from "./items.inputs";
import type { IncludedList, ItemSelect } from "@/lib/types";
import processImage from "@/lib/server/process-image/process-image";
import type { ActionHandler } from "node_modules/astro/dist/actions/runtime/types";

export const getAll: ActionHandler<
  typeof itemInputs.getAll,
  ItemSelect[]
> = async (_, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  const items = await db.select().from(Item).where(eq(Item.userId, userId));
  return items;
};

export const create: ActionHandler<
  typeof itemInputs.create,
  ItemSelect
> = async (data, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [newItem] = await db
    .insert(Item)
    .values({ ...data, userId, id: crypto.randomUUID() })
    .returning();
  return newItem;
};

export const duplicate: ActionHandler<
  typeof itemInputs.duplicate,
  ItemSelect
> = async ({ itemId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  const [item] = await db
    .select()
    .from(Item)
    .where(and(eq(Item.id, itemId), eq(Item.userId, userId)));

  if (!item) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Item not found",
    });
  }

  const [newItem] = await db
    .insert(Item)
    .values({ ...item, id: crypto.randomUUID() })
    .returning();

  return newItem;
};

export const remove: ActionHandler<typeof itemInputs.remove, null> = async (
  { itemId },
  c,
) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [item] = await db
    .select()
    .from(Item)
    .where(and(eq(Item.id, itemId), eq(Item.userId, userId)));

  if (!item) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Item not found",
    });
  }

  if (item.imageR2Key) {
    await c.locals.env.R2_BUCKET.delete(item.imageR2Key);
  }

  await db
    .delete(Item)
    .where(and(eq(Item.id, itemId), eq(Item.userId, userId)));

  return null;
};

export const update: ActionHandler<
  typeof itemInputs.update,
  ItemSelect
> = async (data, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const { id: itemId } = data;

  const [item] = await db
    .select()
    .from(Item)
    .where(and(eq(Item.id, itemId), eq(Item.userId, userId)));

  if (!item) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Item not found",
    });
  }

  const [updated] = await db
    .update(Item)
    .set(data)
    .where(and(eq(Item.id, itemId), eq(Item.userId, userId)))
    .returning();
  return updated;
};

export const getListsIncluded: ActionHandler<
  typeof itemInputs.getListsIncluded,
  IncludedList[]
> = async ({ itemId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  const result = await db
    .select({
      listId: List.id,
      listName: List.name,
      categoryName: Category.name,
    })
    .from(CategoryItem)
    .rightJoin(Category, eq(Category.id, CategoryItem.categoryId))
    .rightJoin(List, eq(List.id, Category.listId))
    .innerJoin(ListUser, eq(ListUser.listId, List.id))
    .where(and(eq(CategoryItem.itemId, itemId), eq(ListUser.userId, userId)));
  return result;
};

export const imageUpload: ActionHandler<
  typeof itemInputs.imageUpload,
  null
> = async ({ itemId, imageFile, removeImageFile }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [item] = await db
    .select({ id: Item.id, userId: Item.userId, imageKey: Item.imageR2Key })
    .from(Item)
    .where(and(eq(Item.id, itemId), eq(Item.userId, userId)));

  if (!item) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Item not found",
    });
  }

  if (item.userId !== userId) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to update this item",
    });
  }

  if (imageFile && imageFile.size > 0) {
    const processed = await processImage(imageFile);

    // delete old image if it exists
    if (item.imageKey) {
      await c.locals.env.R2_BUCKET.delete(item.imageKey);
    }

    // upload new image
    const key = crypto.randomUUID();
    await c.locals.env.R2_BUCKET.put(key, processed);
    await db
      .update(Item)
      .set({ imageR2Key: key, imageType: "file" })
      .where(eq(Item.id, itemId));
  }

  if (removeImageFile && item.imageKey) {
    await c.locals.env.R2_BUCKET.delete(item.imageKey);
    await db.update(Item).set({ imageR2Key: null }).where(eq(Item.id, itemId));
  }

  return null;
};
