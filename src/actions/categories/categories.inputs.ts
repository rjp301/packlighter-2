import { zCategoryInsert } from "@/lib/types";
import { z } from "astro/zod";

export const getFromOtherLists = z.object({ listId: z.string() });
export const copyToList = z.object({
  categoryId: z.string(),
  listId: z.string(),
});
export const create = z.object({
  listId: z.string(),
  data: zCategoryInsert.partial().optional(),
});
export const remove = z.object({ categoryId: z.string() });
export const update = z.object({
  categoryId: z.string(),
  data: zCategoryInsert.omit({ listId: true, id: true }).partial(),
});
export const togglePacked = z.object({ categoryId: z.string() });
