import { ActionError } from "astro:actions";
import {
  Category,
  CategoryItem,
  Item,
  List,
  ListUser,
  User,
} from "@/db/schema";
import { eq, sql, inArray, and } from "drizzle-orm";
import type {
  ExpandedList,
  ExpandedCategory,
  ExpandedCategoryItem,
} from "@/lib/types";
import { createDb } from "@/db";
import type { ActionAPIContext } from "astro:actions";

export const isAuthorized = (context: ActionAPIContext) => {
  const user = context.locals.user;
  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You are not logged in.",
    });
  }
  return user;
};

export const getExpandedList = async (
  context: ActionAPIContext,
  listId: string,
): Promise<ExpandedList> => {
  const db = createDb(context.locals.env);
  const [list] = await db.select().from(List).where(eq(List.id, listId));

  if (!list)
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Could not find list",
    });

  const categories = await db
    .select()
    .from(Category)
    .where(eq(Category.listId, listId))
    .orderBy(Category.sortOrder);

  const categoryIds = categories.map((c) => c.id);

  const categoryItems = await db
    .select()
    .from(CategoryItem)
    .where(
      categoryIds.length > 0
        ? inArray(CategoryItem.categoryId, categoryIds)
        : sql`FALSE`,
    )
    .leftJoin(Item, eq(CategoryItem.itemId, Item.id))
    .orderBy(CategoryItem.sortOrder);

  const expandedCategories: ExpandedCategory[] = categories.map((category) => {
    const items = categoryItems
      .filter((ci) => ci.categoryItem.categoryId === category.id)
      .filter((ci) => ci.item !== null)
      .map((ci) => ({ ...ci.categoryItem, itemData: ci.item! }));
    const packed = items.every((ci) => ci.packed);
    return { ...category, items, packed };
  });

  const result: ExpandedList = { ...list, categories: expandedCategories };
  return result;
};

export const getExpandedCategory = async (
  context: ActionAPIContext,
  categoryId: string,
): Promise<ExpandedCategory> => {
  const db = createDb(context.locals.env);
  const [category] = await db
    .select()
    .from(Category)
    .where(eq(Category.id, categoryId));

  if (!category) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Category not found",
    });
  }

  const categoryItems = await db
    .select()
    .from(CategoryItem)
    .where(eq(CategoryItem.categoryId, categoryId))
    .leftJoin(Item, eq(CategoryItem.itemId, Item.id))
    .orderBy(CategoryItem.sortOrder);

  return {
    ...category,
    items: categoryItems
      .filter((ci) => ci.item !== null)
      .map((ci) => ({ ...ci.categoryItem, itemData: ci.item! })),
    packed: categoryItems.every((ci) => ci.categoryItem.packed),
  };
};

export const getExpandedCategoryItem = async (
  context: ActionAPIContext,
  categoryItemId: string,
): Promise<ExpandedCategoryItem> => {
  const db = createDb(context.locals.env);
  const [categoryItem] = await db
    .select()
    .from(CategoryItem)
    .where(eq(CategoryItem.id, categoryItemId))
    .innerJoin(Item, eq(CategoryItem.itemId, Item.id));

  if (!categoryItem) {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "Category item not found",
    });
  }
  return { ...categoryItem.categoryItem, itemData: categoryItem.item };
};

export const getListItemIds = async (
  context: ActionAPIContext,
  listId: string,
) => {
  const db = createDb(context.locals.env);
  const categoryIds = await db
    .select({ id: Category.id })
    .from(Category)
    .where(eq(Category.listId, listId))
    .then((ids) => ids.map((id) => id.id));

  const categoryItems = await db
    .select({ id: Item.id })
    .from(CategoryItem)
    .where(inArray(CategoryItem.categoryId, categoryIds))
    .rightJoin(Item, eq(CategoryItem.itemId, Item.id));

  return new Set(categoryItems.map((categoryItem) => categoryItem.id));
};

export const getUser = async (context: ActionAPIContext, userId: string) => {
  const db = createDb(context.locals.env);
  const user = await db
    .select()
    .from(User)
    .where(eq(User.id, userId))
    .then((rows) => rows[0]);

  if (!user) return null;
  return user;
};

export const userHasListAccess = async (
  context: ActionAPIContext,
  {
    userId,
    listId,
  }: {
    userId: string;
    listId: string;
  },
) => {
  const db = createDb(context.locals.env);
  const [list] = await db
    .select()
    .from(ListUser)
    .where(
      and(
        eq(ListUser.userId, userId),
        eq(ListUser.listId, listId),
        eq(ListUser.isPending, false),
      ),
    );

  if (!list) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "List not found",
    });
  }
};
