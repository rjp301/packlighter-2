import { weightUnits } from "@/api/helpers/weight-units";
import { NOW, column, defineDb, defineTable } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    githubId: column.number({ unique: true }),
    username: column.text({ unique: true }),
    name: column.text(),
    avatarUrl: column.text(),
    createdAt: column.text({ default: NOW }),
  },
});

const UserSession = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    expiresAt: column.number(),
    createdAt: column.text({ default: NOW }),
  },
});

const Item = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    createdAt: column.text({ default: NOW }),

    name: column.text({ default: "" }),
    description: column.text({ default: "" }),
    weight: column.number({ default: 0 }),
    weightUnit: column.text({ default: weightUnits.g }),
    image: column.text({ optional: true }),
  },
});

const List = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    createdAt: column.text({ default: NOW }),

    name: column.text({ default: "" }),
    description: column.text({ default: "" }),

    categories: column.json({ default: [] }),

    showImages: column.boolean({ default: false }),
    showPrices: column.boolean({ default: false }),
    showPacked: column.boolean({ default: false }),
    showWeights: column.boolean({ default: false }),

    sortOrder: column.number({ default: 0 }),
    weightUnit: column.text({ default: weightUnits.g }),
  },
});

const Category = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    listId: column.text({ references: () => List.columns.id }),
    createdAt: column.text({ default: NOW }),

    name: column.text({ default: "" }),
    sortOrder: column.number({ default: 0 }),
  },
});

const CategoryItem = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    categoryId: column.text({ references: () => Category.columns.id }),
    itemId: column.text({ references: () => Item.columns.id }),
    createdAt: column.text({ default: NOW }),

    sortOrder: column.number({ default: 0 }),
    quantity: column.number({ default: 1 }),

    packed: column.boolean({ default: false }),
    wornWeight: column.boolean({ default: false }),
    consWeight: column.boolean({ default: false }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { User, UserSession, Item, List, Category, CategoryItem },
});
