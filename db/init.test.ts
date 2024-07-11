import { expect, test } from "vitest";
import { initCategory } from "./init";

test("initialize category with no starting point", () => {
  expect(initCategory()).toBeDefined();
});

test("initialize category with a starting point", () => {
  const newCategory = initCategory({ name: "test" });
  console.log(newCategory);
  expect(newCategory).toHaveProperty("name");
  expect(newCategory).toHaveProperty("id");
});
