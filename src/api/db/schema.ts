import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  real,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { v4 as uuidV4 } from "uuid";

const id = uuid("id").primaryKey().$defaultFn(uuidV4);
const createdAt = timestamp("created_at", { mode: "string" })
  .defaultNow()
  .notNull();
const userId = text("user_id")
  .references(() => User.id, { onDelete: "cascade" })
  .notNull();

export const User = pgTable("users", {
  id,
  createdAt,
  githubId: integer("github_id").unique().notNull(),
  username: text("username").unique().notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
});

export const UserSession = pgTable("user_sessions", {
  id,
  createdAt,
  userId,
  expiresAt: integer("expires_at").notNull(),
});

export const WeightUnits = pgEnum("weight_units", ["g", "kg", "oz", "lb"]);

export const Item = pgTable("items", {
  id,
  userId,
  createdAt,

  name: text("name").default(""),
  description: text("description").default(""),
  weight: real("weight").default(0),
  weightUnit: WeightUnits("weight_unit").default("g"),
  image: text("image"),
});

export const List = pgTable("lists", {
  id,
  userId,
  createdAt,

  name: text("name").default(""),
  description: text("description").default(""),

  showImages: boolean("show_images").default(false),
  showPrices: boolean("show_prices").default(false),
  showPacked: boolean("show_packed").default(false),
  showWeights: boolean("show_weights").default(false),

  sortOrder: integer("sort_order").default(0),
  weightUnit: WeightUnits("weight_unit").default("g"),
});

export const Category = pgTable("categories", {
  id,
  userId,
  createdAt,
  listId: text("list_id")
    .references(() => List.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").default(""),
  sortOrder: integer("sort_order").default(0),
});

export const CategoryItem = pgTable("category_items", {
  id,
  userId,
  createdAt,
  categoryId: text("category_id")
    .references(() => Category.id, { onDelete: "cascade" })
    .notNull(),
  itemId: text("item_id")
    .references(() => Item.id, { onDelete: "cascade" })
    .notNull(),

  sortOrder: integer("sort_order").default(0),
  quantity: integer("quantity").default(1),

  packed: boolean("packed").default(false),
  wornWeight: boolean("worn_weight").default(false),
  consWeight: boolean("cons_weight").default(false),
});
