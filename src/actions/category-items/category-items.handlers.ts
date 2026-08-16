import { ActionError } from "astro:actions";
import {
  getExpandedCategoryItem,
  getListItemIds,
  isAuthorized,
  userHasListAccess,
} from "@/actions/helpers";
import { CategoryItem, Item, Category } from "@/db/schema";
import { eq, max } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import type { CategoryItemSelect, ExpandedCategoryItem } from "@/lib/types";
import * as categoryItemInputs from "./category-items.inputs";
import { createDb } from "@/db";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import type { ActionHandler } from "node_modules/astro/dist/actions/runtime/types";

export const create: ActionHandler<
  typeof categoryItemInputs.create,
  ExpandedCategoryItem
> = async ({ data }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .where(eq(Category.id, data.categoryId));

  await userHasListAccess(c, { userId, listId });

  const listItemIds = await getListItemIds(c, listId);

  if (listItemIds.has(data.itemId)) {
    throw new ActionError({
      code: "CONFLICT",
      message: "Item already exists in the list",
    });
  }

  const [{ max: maxSortOrder }] = await db
    .select({ max: max(CategoryItem.sortOrder) })
    .from(CategoryItem)
    .where(eq(CategoryItem.categoryId, data.categoryId));

  const [created] = await db
    .insert(CategoryItem)
    .values({
      id: uuid(),
      ...data,
      sortOrder: maxSortOrder ?? 0,
    })
    .returning();

  if (data.sortOrder !== undefined) {
    const categoryItems = await db
      .select()
      .from(CategoryItem)
      .where(eq(CategoryItem.categoryId, data.categoryId))
      .orderBy(CategoryItem.sortOrder);

    const categoryItemIds = categoryItems.map((i) => i.id);
    const indexOfCategoryItem = categoryItemIds.indexOf(created.id);

    const reordered = reorder({
      list: categoryItemIds,
      startIndex: indexOfCategoryItem,
      finishIndex: data.sortOrder,
    });

    await Promise.all(
      reordered.map((id, index) =>
        db
          .update(CategoryItem)
          .set({ sortOrder: index })
          .where(eq(CategoryItem.id, id)),
      ),
    );
  }

  return getExpandedCategoryItem(c, created.id);
};

export const createAndAddToCategory: ActionHandler<
  typeof categoryItemInputs.createAndAddToCategory,
  CategoryItemSelect
> = async ({ categoryId, itemData, categoryItemData }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .where(eq(Category.id, categoryId));

  await userHasListAccess(c, { userId, listId });

  const [newItem] = await db
    .insert(Item)
    .values({ id: uuid(), ...itemData, userId })
    .returning();

  const [{ max: maxSortOrder }] = await db
    .select({ max: max(CategoryItem.sortOrder) })
    .from(CategoryItem)
    .where(eq(CategoryItem.categoryId, categoryId));

  const [created] = await db
    .insert(CategoryItem)
    .values({
      id: uuid(),
      sortOrder: maxSortOrder ?? 1,
      categoryId,
      itemId: newItem.id,
      ...categoryItemData,
    })
    .returning();

  return created;
};

export const update: ActionHandler<
  typeof categoryItemInputs.update,
  CategoryItemSelect
> = async ({ categoryItemId, data }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .innerJoin(CategoryItem, eq(CategoryItem.categoryId, Category.id))
    .where(eq(CategoryItem.id, categoryItemId));

  await userHasListAccess(c, { userId, listId });

  const [updated] = await db
    .update(CategoryItem)
    .set(data)
    .where(eq(CategoryItem.id, categoryItemId))
    .returning();

  const { categoryId, sortOrder } = data;

  if (sortOrder !== undefined) {
    const categoryItems = await db
      .select()
      .from(CategoryItem)
      .where(eq(CategoryItem.categoryId, categoryId || updated.categoryId))
      .orderBy(CategoryItem.sortOrder);

    const categoryItemIds = categoryItems.map((i) => i.id);
    const indexOfCategoryItem = categoryItemIds.indexOf(categoryItemId);

    const reordered = reorder({
      list: categoryItemIds,
      startIndex: indexOfCategoryItem,
      finishIndex: sortOrder,
    });

    await Promise.all(
      reordered.map((id, index) =>
        db
          .update(CategoryItem)
          .set({ sortOrder: index })
          .where(eq(CategoryItem.id, id)),
      ),
    );
  }

  return updated;
};

export const remove: ActionHandler<
  typeof categoryItemInputs.remove,
  null
> = async ({ categoryItemId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .innerJoin(CategoryItem, eq(CategoryItem.categoryId, Category.id))
    .where(eq(CategoryItem.id, categoryItemId));

  await userHasListAccess(c, { userId, listId });

  const [deleted] = await db
    .delete(CategoryItem)
    .where(eq(CategoryItem.id, categoryItemId))
    .returning();

  // delete item if it has no name, description, and weight
  const [item] = await db
    .select()
    .from(Item)
    .where(eq(Item.id, deleted.itemId));
  if (item.name === "" && item.description === "" && item.weight === 0) {
    await db.delete(Item).where(eq(Item.id, deleted.itemId));
  }

  return null;
};
