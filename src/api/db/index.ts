import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import env from "../env";

const client = new Client({
  connectionString: env.DB_STRING,
});

await client.connect();
export const db = drizzle(client);
