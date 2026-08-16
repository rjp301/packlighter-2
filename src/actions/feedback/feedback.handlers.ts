import { isAuthorized } from "@/actions/helpers";
import { createDb } from "@/db";
import { v4 as uuid } from "uuid";
import { AppFeedback } from "@/db/schema";
import * as feedbackInputs from "./feedback.inputs";
import type { AppFeedbackSelect } from "@/lib/types";
import type { ActionHandler } from "node_modules/astro/dist/actions/runtime/types";

export const create: ActionHandler<
  typeof feedbackInputs.create,
  AppFeedbackSelect
> = async ({ feedback }, c) => {
  const db = createDb(c.locals.env);
  const userId = isAuthorized(c).id;
  return await db
    .insert(AppFeedback)
    .values({ id: uuid(), feedback, userId })
    .returning()
    .then((rows) => rows[0]);
};
