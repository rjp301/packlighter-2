import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const policies = defineCollection({
  type: "content",
  schema: z.object({
    sortOrder: z.number(),
    title: z.string(),
    icon: z.string(),
  }),
});

export const collections = {
  policies,
};
