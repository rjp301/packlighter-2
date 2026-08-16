import {
  AppFeedback,
  Category,
  CategoryItem,
  Item,
  List,
  ListUser,
  User,
  type weightTypes,
  type weightUnits,
} from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "astro/zod";

export type WeightUnit = (typeof weightUnits)[number];
export type WeightType = (typeof weightTypes)[number];

export type Unit = {
  symbol: string;
  multiplier: number;
  name: string;
};

export type IncludedList = {
  listId: string;
  listName: string;
  categoryName: string | null;
};

export type OtherCategory = {
  id: string;
  name: string;
  listName: string;
  listId: string;
};

export const zUserSelect = createSelectSchema(User);
export const zUserInsert = createInsertSchema(User);
export type UserSelect = z.infer<typeof zUserSelect>;
export type UserInsert = z.infer<typeof zUserInsert>;

export type UserSessionInfo = {
  id: string;
  userId: string;
  expiresAt: Date;
};

export const zItemSelect = createSelectSchema(Item).extend({
  weight: z.coerce.number(),
});
export const zItemInsert = createInsertSchema(Item).extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  weight: z.coerce.number().optional(),
});
export type ItemSelect = z.infer<typeof zItemSelect>;
export type ItemInsert = z.infer<typeof zItemInsert>;

export const zItemForm = zItemInsert.omit({ userId: true }).extend({
  imageFile: z.instanceof(File).optional(),
  removeImageFile: z.boolean().optional(),
});
export type ItemForm = z.infer<typeof zItemForm>;

export const zItemImageForm = zItemForm.pick({
  imageFile: true,
  removeImageFile: true,
  imageType: true,
  image: true,
});
export type ItemImageForm = z.infer<typeof zItemImageForm>;

export const zListSelect = createSelectSchema(List);
export const zListInsert = createInsertSchema(List);
export type ListSelect = z.infer<typeof zListSelect>;
export type ListInsert = z.infer<typeof zListInsert>;

export const zListUserSelect = createSelectSchema(ListUser);
export const zListUserInsert = createInsertSchema(ListUser);
export type ListUserSelect = z.infer<typeof zListUserSelect>;
export type ListUserInsert = z.infer<typeof zListUserInsert>;

export const zCategorySelect = createSelectSchema(Category);
export const zCategoryInsert = createInsertSchema(Category);
export type CategorySelect = z.infer<typeof zCategorySelect>;
export type CategoryInsert = z.infer<typeof zCategoryInsert>;

export const zCategoryItemSelect = createSelectSchema(CategoryItem);
export const zCategoryItemInsert = createInsertSchema(CategoryItem);
export type CategoryItemSelect = z.infer<typeof zCategoryItemSelect>;
export type CategoryItemInsert = z.infer<typeof zCategoryItemInsert>;

export const zAppFeedbackSelect = createSelectSchema(AppFeedback);
export const zAppFeedbackInsert = createInsertSchema(AppFeedback);
export type AppFeedbackSelect = z.infer<typeof zAppFeedbackSelect>;
export type AppFeedbackInsert = z.infer<typeof zAppFeedbackInsert>;

export const zExpandedCategoryItem = zCategoryItemSelect.extend({
  itemData: zItemSelect,
});
export type ExpandedCategoryItem = z.infer<typeof zExpandedCategoryItem>;

export const zExpandedCategory = zCategorySelect.extend({
  items: z.array(zExpandedCategoryItem),
  packed: z.boolean(),
});
export type ExpandedCategory = z.infer<typeof zExpandedCategory>;

export const zExpandedList = zListSelect.extend({
  categories: z.array(zExpandedCategory),
});
export type ExpandedList = z.infer<typeof zExpandedList>;
