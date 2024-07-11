import type { Item, List } from "astro:db";
import type { Category } from "./schema";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ItemSelect = typeof Item.$inferSelect;
export type ItemInsert = typeof Item.$inferInsert;

export type ListSelect = typeof List.$inferSelect;
export type ListInsert = typeof List.$inferInsert;

export type ExpandedList = Prettify<
  Omit<ListSelect, "categories"> & {
    categories: Category[];
  }
>;
export type ExpandedListInsert = Prettify<
  Omit<ListInsert, "categories"> & {
    categories: string[];
  }
>;

export type AllTables = typeof List | typeof Item;
