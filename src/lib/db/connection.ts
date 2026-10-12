import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not set - using fallback connection');
}

const client = postgres(connectionString || 'postgresql://localhost:5432/secondary_yaza');

export const db = drizzle(client);
export { client };
