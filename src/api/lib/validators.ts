import { and, db, eq } from "astro:db";
import { z } from "zod";
import type { AllTables } from "../../../db/types";

export const validIdSchema = (table: AllTables) =>
  z.string().refine(async (value) => {
    const list = await db.select().from(table).where(eq(table.id, value));
    return list.length > 0;
  });

export const idAndUserIdFilter = (
  table: AllTables,
  props: { userId: string; id: string },
) => and(eq(table.id, props.id), eq(table.userId, props.userId));
