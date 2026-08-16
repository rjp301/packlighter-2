import { z } from "astro/zod";

export const create = z.object({ feedback: z.string() });
