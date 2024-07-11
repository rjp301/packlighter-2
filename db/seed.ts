import { generateId } from "@/api/helpers/generate-id";
import { Category, CategoryItem, Item, List, User, db } from "astro:db";
import { randomItemFromArray, randomNumberWithinRange } from "./seeds/utils";
import { categoryNames } from "./seeds/category-names";
import { itemNamesDescs } from "./seeds/item-names-descs";
import { weightUnits } from "@/api/helpers/weight-units";
import { listNamesDescs } from "./seeds/list-names-descs";
import { imageLinks } from "./seeds/image-links";
import { initCategory, initCategoryItem } from "./init";

// https://astro.build/db/seed
export default async function seed() {
  const { id: userId } = await db
    .insert(User)
    .values({
      id: generateId(),
      githubId: 71047303,
      username: "rjp301",
      name: "Riley Paul",
      avatarUrl: "https://avatars.githubusercontent.com/u/71047303?v=4",
    })
    .returning()
    .then((rows) => rows[0]);

  const items = await db
    .insert(Item)
    .values(
      itemNamesDescs.map(({ name, description }) => ({
        id: generateId(),
        userId,
        name,
        description,
        image: randomItemFromArray(imageLinks),
        weight: randomNumberWithinRange(1, 1000),
        weightUnits: randomItemFromArray(Object.values(weightUnits)),
      })),
    )
    .returning();
  console.log(`✅ Seeded ${items.length} items`);

  const lists = await db
    .insert(List)
    .values(
      listNamesDescs.map(({ name, description }) => ({
        id: generateId(),
        userId,
        name,
        description,
        categories: new Array(randomNumberWithinRange(2, 7)).fill(0).map(() => {
          const categoryItems = new Array(randomNumberWithinRange(2, 7))
            .fill(0)
            .map(() =>
              initCategoryItem({
                itemId: randomItemFromArray(items).id,
                quantity: randomNumberWithinRange(1, 10),
              }),
            );
          return initCategory({
            name: randomItemFromArray(categoryNames),
            items: categoryItems,
          });
        }),
      })),
    )
    .returning();
  console.log(`✅ Seeded ${lists.length} lists`);

  const categories = await db
    .insert(Category)
    .values(
      new Array(20).fill(0).map(() => ({
        id: generateId(),
        listId: randomItemFromArray(lists).id,
        userId,
        name: randomItemFromArray(categoryNames),
      })),
    )
    .returning();
  console.log(`✅ Seeded ${categories.length} categories`);

  const categoryItems = await db
    .insert(CategoryItem)
    .values(
      new Array(100).fill(0).map(() => ({
        id: generateId(),
        userId,
        categoryId: randomItemFromArray(categories).id,
        itemId: randomItemFromArray(items).id,
        quantity: randomNumberWithinRange(1, 10),
      })),
    )
    .returning();
  console.log(`✅ Seeded ${categoryItems.length} categoryItems`);
}
