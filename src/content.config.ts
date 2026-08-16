import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const policies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/policies" }),
  schema: z.object({
    sortOrder: z.number(),
    title: z.string(),
    icon: z.string(),
  }),
});

export const collections = { policies };
