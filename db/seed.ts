import { generateId } from "@/api/helpers/generate-id";
import { Item, List, User, db } from "astro:db";
import {
  randomItemFromArray,
  randomLengthArray,
  randomNumberWithinRange,
} from "./seeds/utils";
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
  console.log(`✅ Seeded user`);

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

  let numCategoryItems = 0;
  let numCategories = 0;

  const lists = await db
    .insert(List)
    .values(
      listNamesDescs.map(({ name, description }) => ({
        id: generateId(),
        userId,
        name,
        description,
        categories: randomLengthArray(2, 7).map(() => {
          numCategories++;
          const categoryItems = randomLengthArray(2, 7).map(() => {
            numCategoryItems++;
            return initCategoryItem({
              itemId: randomItemFromArray(items).id,
              quantity: randomNumberWithinRange(1, 10),
            });
          });
          return initCategory({
            name: randomItemFromArray(categoryNames),
            items: categoryItems,
          });
        }),
      })),
    )
    .returning();
  console.log(`✅ Seeded ${lists.length} lists`);
  console.log(`✅ Seeded ${numCategories} categories`);
  console.log(`✅ Seeded ${numCategoryItems} category items`);
}
