import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL is not set. Falling back to default: postgres://postgres:postgres@localhost:5432/explorer");
}

const client = postgres(databaseUrl || 'postgres://postgres:postgres@localhost:5432/explorer');
export const db = drizzle(client, { schema });
export type DbType = typeof db;
