import { z } from "astro/zod";
import { zListInsert } from "@/lib/types";

export const getAll = z.any();
export const getOne = z.object({
  listId: z.string(),
});
export const create = z.object({
  data: zListInsert.partial().optional(),
});
export const update = z.object({
  listId: z.string(),
  data: zListInsert.omit({ id: true }).partial(),
});
export const remove = z.object({ listId: z.string() });
export const unpack = z.object({ listId: z.string() });
export const duplicate = z.object({ listId: z.string() });
