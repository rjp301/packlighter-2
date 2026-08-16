import { Category, CategoryItem, List, ListUser } from "@/db/schema";
import { eq, max, and, ne, desc, notInArray } from "drizzle-orm";
import { ActionError } from "astro:actions";
import {
  getExpandedCategory,
  isAuthorized,
  userHasListAccess,
} from "@/actions/helpers";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

import { v4 as uuid } from "uuid";
import * as categoryInputs from "./categories.inputs";
import type { ExpandedCategory, OtherCategory } from "@/lib/types";
import { createDb } from "@/db";
import type { ActionHandler } from "node_modules/astro/dist/actions/runtime/types";

export const getFromOtherLists: ActionHandler<
  typeof categoryInputs.getFromOtherLists,
  OtherCategory[]
> = async ({ listId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { listId, userId });

  const categories = await db
    .select({
      id: Category.id,
      name: Category.name,
      listName: List.name,
      listId: List.id,
    })
    .from(Category)
    .innerJoin(List, eq(Category.listId, List.id))
    .innerJoin(ListUser, eq(ListUser.listId, List.id))
    .where(and(ne(Category.listId, listId), eq(ListUser.userId, userId)))
    .orderBy(desc(List.sortOrder), desc(Category.sortOrder));
  return categories;
};

export const copyToList: ActionHandler<
  typeof categoryInputs.copyToList,
  ExpandedCategory
> = async ({ categoryId, listId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { userId, listId });

  const [{ max: maxSortOrder }] = await db
    .select({ max: max(Category.sortOrder) })
    .from(Category)
    .where(eq(Category.listId, listId));

  const [{ category }] = await db
    .select()
    .from(Category)
    .innerJoin(ListUser, eq(ListUser.listId, Category.listId))
    .where(and(eq(Category.id, categoryId), eq(ListUser.userId, userId)));

  if (!category) {
    throw new ActionError({
      message: "Category not found",
      code: "NOT_FOUND",
    });
  }

  const listItemIds = await db
    .select({ id: CategoryItem.itemId })
    .from(CategoryItem)
    .innerJoin(Category, eq(CategoryItem.categoryId, Category.id))
    .innerJoin(ListUser, eq(ListUser.listId, Category.listId))
    .where(and(eq(Category.listId, listId), eq(ListUser.userId, userId)))
    .then((rows) => rows.map((row) => row.id));

  const categoryItems = await db
    .select()
    .from(CategoryItem)
    .where(
      and(
        eq(CategoryItem.categoryId, categoryId),
        listItemIds.length > 0
          ? notInArray(CategoryItem.itemId, listItemIds)
          : undefined,
      ),
    );

  const [newCategory] = await db
    .insert(Category)
    .values({
      ...category,
      id: uuid(),
      sortOrder: maxSortOrder ? maxSortOrder + 1 : undefined,
      listId,
    })
    .returning();

  await Promise.all(
    categoryItems.map((item) =>
      db.insert(CategoryItem).values({
        ...item,
        id: uuid(),
        packed: false,
        categoryId: newCategory.id,
      }),
    ),
  );
  return getExpandedCategory(c, newCategory.id);
};

export const create: ActionHandler<
  typeof categoryInputs.create,
  ExpandedCategory
> = async ({ listId, data }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { userId, listId });

  const [{ max: maxSortOrder }] = await db
    .select({ max: max(Category.sortOrder) })
    .from(Category)
    .where(eq(Category.listId, listId));

  const [{ id: categoryId }] = await db
    .insert(Category)
    .values({
      sortOrder: maxSortOrder ? maxSortOrder + 1 : undefined,
      ...data,
      listId,
    })
    .returning();

  return getExpandedCategory(c, categoryId);
};

export const remove: ActionHandler<typeof categoryInputs.remove, null> = async (
  { categoryId },
  c,
) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .where(eq(Category.id, categoryId));

  await userHasListAccess(c, { listId, userId });
  await db.delete(Category).where(eq(Category.id, categoryId));
  return null;
};

export const update: ActionHandler<
  typeof categoryInputs.update,
  ExpandedCategory
> = async ({ categoryId, data }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .where(eq(Category.id, categoryId));

  await userHasListAccess(c, { listId, userId });

  const { sortOrder } = data;

  await db.update(Category).set(data).where(eq(Category.id, categoryId));

  if (sortOrder !== undefined) {
    const categories = await db
      .select({ id: Category.id })
      .from(Category)
      .where(eq(Category.listId, listId))
      .orderBy(Category.sortOrder);

    const categoryIds = categories.map((l) => l.id);
    const indexOfCategory = categoryIds.indexOf(categoryId);

    const reordered = reorder({
      list: categoryIds,
      startIndex: indexOfCategory,
      finishIndex: sortOrder,
    });

    await Promise.all(
      reordered.map((categoryId, idx) =>
        db
          .update(Category)
          .set({ sortOrder: idx })
          .where(eq(Category.id, categoryId)),
      ),
    );
  }

  return getExpandedCategory(c, categoryId);
};

export const togglePacked: ActionHandler<
  typeof categoryInputs.togglePacked,
  ExpandedCategory
> = async ({ categoryId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ listId }] = await db
    .select({ listId: Category.listId })
    .from(Category)
    .where(eq(Category.id, categoryId));

  await userHasListAccess(c, { userId, listId });

  const categoryItems = await db
    .select()
    .from(CategoryItem)
    .where(eq(CategoryItem.categoryId, categoryId));

  const fullyPacked = categoryItems.every((item) => item.packed);

  await db
    .update(CategoryItem)
    .set({ packed: !fullyPacked })
    .where(eq(CategoryItem.categoryId, categoryId));

  return getExpandedCategory(c, categoryId);
};
