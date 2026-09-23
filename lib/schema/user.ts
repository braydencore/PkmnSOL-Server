import {
  pgTable,
  integer,
  varchar,
  char,
  boolean,
  smallint,
  timestamp,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { account } from './account';

export const user = pgTable(
  'user',
  {
    accountId: integer('account_id')
      .primaryKey()
      .references(() => account.id, { onDelete: 'cascade' }),
    // Matches the account's own username length now that nickname is
    // derived from it at signup rather than freely chosen (local usernames
    // are 6-20 chars; see auth.schema.ts).
    nickname: varchar('nickname', { length: 20 }).notNull().unique(),
    money: integer('money').notNull().default(0),
    playtime: integer('playtime').notNull().default(0),
    hasStarter: boolean('has_starter').notNull().default(true),
    gender: smallint('gender').notNull(),
    lastMapId: char('last_map_id', { length: 4 }).notNull(),
    lastX: integer('last_x').notNull(),
    lastY: integer('last_y').notNull(),
    safariTicketRegenAt: timestamp('safari_ticket_regen_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check('ck_user_money', sql`${table.money} >= 0`)],
);
