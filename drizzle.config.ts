import { defineConfig } from 'drizzle-kit';

// drizzle-kit uses its own separate DB connection (the 'pg' driver) for
// schema push/introspection — it does NOT share the app's postgres.js
// client in lib/db.ts, so that file's ssl fix doesn't cover this one.
// Managed Postgres (Render, Heroku, ...) requires SSL on this connection
// too, and local/dev Postgres has none configured, so only require it in
// prod, same as lib/db.ts.
const sslParam = process.env.NODE_ENV === 'PROD' ? '?sslmode=require' : '';

export default defineConfig({
  schema: './lib/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}${sslParam}`,
  },
});
