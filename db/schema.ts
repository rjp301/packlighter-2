import { z } from "zod";
import { v4 as uuid } from "uuid";

export const zCategoryItem = z.object({
  id: z.string().default(uuid()),
  itemId: z.string().default(""),
  quantity: z.number().default(1),
  packed: z.boolean().default(false),
  createdAt: z.string().default(new Date().toISOString()),
});

export const zCategory = z.object({
  id: z.string().default(uuid()),
  name: z.string().default(""),
  description: z.string().default(""),
  createdAt: z.string().default(new Date().toISOString()),
  items: z.array(zCategoryItem).default([]),
});

export const zListCategories = z.array(zCategory).catch([]);
