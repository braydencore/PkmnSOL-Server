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
  } catch (error) {
    logger.error(`${serviceName} Error initializing PostgreSQL connection:`, error);
    throw error;
  }
};
