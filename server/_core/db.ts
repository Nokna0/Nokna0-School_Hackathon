import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = mysql.createPool(process.env.DATABASE_URL);

export const db = drizzle(pool, {
  schema,
  mode: "default",
});

export type Database = typeof db;
