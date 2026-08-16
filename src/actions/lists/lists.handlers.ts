import { createDb } from "@/db";
import { List, Category, CategoryItem, ListUser } from "@/db/schema";
import { eq, inArray, max } from "drizzle-orm";
import { type ActionAPIContext } from "astro:actions";
import {
  getExpandedList,
  isAuthorized,
  userHasListAccess,
} from "@/actions/helpers";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

import type * as listInputs from "./lists.inputs";
import type { ExpandedList, ListSelect } from "@/lib/types";
import type { ActionHandler } from "node_modules/astro/dist/actions/runtime/types";

const getAllUserLists = async (
  c: ActionAPIContext,
  { userId }: { userId: string },
): Promise<ListSelect[]> => {
  const db = createDb(c.locals.env);
  const lists = await db
    .select()
    .from(List)
    .innerJoin(ListUser, eq(ListUser.listId, List.id))
    .where(eq(ListUser.userId, userId))
    .orderBy(List.sortOrder)
    .then((data) => data.map(({ list }) => list));
  return lists;
};

export const getAll: ActionHandler<
  typeof listInputs.getAll,
  ListSelect[]
> = async (_, c) => {
  const userId = isAuthorized(c).id;
  return getAllUserLists(c, { userId });
};

export const getOne: ActionHandler<
  typeof listInputs.getOne,
  ExpandedList
> = async ({ listId }, c) => {
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { userId, listId });
  return getExpandedList(c, listId);
};

export const create: ActionHandler<
  typeof listInputs.create,
  ListSelect
> = async ({ data }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;

  const [{ max: maxSortOrder }] = await db
    .select({ max: max(List.sortOrder) })
    .from(List);

  const [newList] = await db
    .insert(List)
    .values({
      sortOrder: maxSortOrder ? maxSortOrder + 1 : undefined,
      ...data,
    })
    .returning();

  await db.insert(ListUser).values({
    userId,
    listId: newList.id,
    isAdmin: true,
    isPending: false,
  });

  return newList;
};

export const update: ActionHandler<
  typeof listInputs.update,
  ListSelect
> = async ({ listId, data }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  const { sortOrder } = data;

  await userHasListAccess(c, { listId, userId });

  const [updated] = await db
    .update(List)
    .set(data)
    .where(eq(List.id, listId))
    .returning();

  if (sortOrder !== undefined) {
    const lists = await getAllUserLists(c, { userId });
    const listIds = lists.map((l) => l.id);
    const indexOfList = listIds.indexOf(listId);

    const reordered = reorder({
      list: listIds,
      startIndex: indexOfList,
      finishIndex: sortOrder,
    });

    await Promise.all(
      reordered.map((listId, idx) => {
        return db
          .update(List)
          .set({ sortOrder: idx })
          .where(eq(List.id, listId))
          .returning();
      }),
    );
  }

  return updated;
};

export const remove: ActionHandler<typeof listInputs.remove, null> = async (
  { listId },
  c,
) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { userId, listId });

  await db.delete(List).where(eq(List.id, listId));
  return null;
};

export const unpack: ActionHandler<
  typeof listInputs.unpack,
  ExpandedList
> = async ({ listId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { userId, listId });
  const categoryItems = await db
    .select({ id: CategoryItem.id })
    .from(CategoryItem)
    .leftJoin(Category, eq(Category.id, CategoryItem.categoryId))
    .where(eq(Category.listId, listId));
  const ids = categoryItems.filter((i) => i !== null).map((ci) => ci.id!);
  await db
    .update(CategoryItem)
    .set({ packed: false })
    .where(inArray(CategoryItem.id, ids));
  return getExpandedList(c, listId);
};

export const duplicate: ActionHandler<
  typeof listInputs.duplicate,
  ExpandedList
> = async ({ listId }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  await userHasListAccess(c, { userId, listId });

  const [list] = await db.select().from(List).where(eq(List.id, listId));

  const categories = await db
    .select()
    .from(Category)
    .where(eq(Category.listId, listId))
    .orderBy(Category.sortOrder);

  const categoryItems = await db
    .select()
    .from(CategoryItem)
    .leftJoin(Category, eq(CategoryItem.categoryId, Category.id))
    .where(eq(Category.listId, listId));

  const [{ id: newListId }] = await db
    .insert(List)
    .values({
      ...list,
      id: crypto.randomUUID(),
      name: `${list.name} (Copy)`,
    })
    .returning();

  await db.insert(ListUser).values({
    listId: newListId,
    userId,
    isAdmin: true,
    isPending: false,
  });

  await Promise.all(
    categories.map(async (category) => {
      const newCategory = await db
        .insert(Category)
        .values({
          ...category,
          id: crypto.randomUUID(),
          listId: newListId,
        })
        .returning()
        .then((rows) => rows[0]);

      const newCategoryItems = categoryItems
        .filter((ci) => ci.categoryItem.categoryId === category.id)
        .map((ci) => ({
          ...ci.categoryItem,
          id: crypto.randomUUID(),
          categoryId: newCategory.id,
        }));

      await db.insert(CategoryItem).values(newCategoryItems);
      return newCategory;
    }),
  );

  return getExpandedList(c, newListId);
};
