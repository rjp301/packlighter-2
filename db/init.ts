import {
  zCategory,
  zCategoryItem,
  type Category,
  type CategoryItem,
} from "./schema";

export const initCategoryItem = (values: Partial<CategoryItem>): CategoryItem =>
  zCategoryItem.parse(values);

export const initCategory = (values: Partial<Category>): Category =>
  zCategory.parse(values);
