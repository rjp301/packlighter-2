import { zCategoryItemInsert, zItemInsert } from "@/lib/types";
import { z } from "astro/zod";

export const create = z.object({
  data: zCategoryItemInsert,
});
export const createAndAddToCategory = z.object({
  categoryId: z.string(),
  itemData: zItemInsert.partial().optional(),
  categoryItemData: zCategoryItemInsert.partial().optional(),
});
export const update = z.object({
  categoryItemId: z.string(),
  data: zCategoryItemInsert.partial(),
});
export const remove = z.object({ categoryItemId: z.string() });
