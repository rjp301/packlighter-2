import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import "dotenv/config";

const client = new Client({
  connectionString: process.env.DB_STRING,
});

await client.connect();
export const db = drizzle(client);
