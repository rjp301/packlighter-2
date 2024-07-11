import type { Category, CategoryItem, Item, List } from "astro:db";
import type { z } from "zod";
import type { zCategory } from "./schema";

export type ItemSelect = typeof Item.$inferSelect;
export type ListSelect = typeof List.$inferSelect;

export type ExpandedCategory = z.infer<typeof zCategory>;

export type ExpandedList = typeof List.$inferSelect & {
  categories: ExpandedCategory[];
};

export type AllTables =
  | typeof List
  | typeof Item
  | typeof Category
  | typeof CategoryItem;
