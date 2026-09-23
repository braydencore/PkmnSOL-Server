import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { envConfig } from './utils';
import { logger } from './utils/logger';
import * as schema from './schema';

const client = postgres({
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  user: envConfig.DB_USERNAME,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_DATABASE,
  max: envConfig.DB_POOL_MAX,
  // Managed Postgres hosts (Render, Heroku, Supabase, ...) require SSL on
  // their external connection string and reject plain connections outright
  // (surfaces as a 28000 "invalid_authorization_specification" error, not
  // anything that looks like an SSL problem). Local/dev Postgres has no SSL
  // configured at all, so only require it in prod.
  ssl: envConfig.NODE_ENV === 'PROD' ? 'require' : undefined,
});

export const db = drizzle(client, { schema, logger: envConfig.NODE_ENV === 'DEV' });

export const connectDB = async (serviceName: string) => {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info(`${serviceName} PostgreSQL connection initialized successfully.`);
    await runOneTimeSchemaFixes();
  } catch (error) {
    logger.error(`${serviceName} Error initializing PostgreSQL connection:`, error);
    throw error;
  }
};

/**
 * One-off, idempotent schema patches applied at boot -- for changes that
 * need to land before dependent code does, when nobody has hands-on
 * production DB access to run the usual `db:push:prod` first. Safe to
 * leave running on every restart: each statement is a no-op once already
 * applied, so this never needs its own migration journal entry.
 */
async function runOneTimeSchemaFixes(): Promise<void> {
  // nickname is now derived from the account's username (6-20 chars)
  // instead of being freely chosen at signup (was 2-12) -- widen to fit.
  await db.execute(sql`ALTER TABLE "user" ALTER COLUMN nickname TYPE varchar(20)`);
}
