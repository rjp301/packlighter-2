import { zItemInsert } from "@/lib/types";
import { z } from "astro/zod";

export const getAll = z.any();
export const create = zItemInsert.omit({ userId: true });
export const update = zItemInsert
  .omit({ userId: true })
  .partial()
  .required({ id: true });
export const duplicate = z.object({ itemId: z.string() });
export const remove = z.object({ itemId: z.string() });
export const getListsIncluded = z.object({ itemId: z.string() });
export const imageUpload = z.object({
  itemId: z.string(),
  imageFile: z.instanceof(File).optional(),
  removeImageFile: z.boolean().optional(),
});
