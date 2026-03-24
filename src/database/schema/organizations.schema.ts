import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  bigint,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationPda: varchar('organization_pda', { length: 44 })
    .notNull()
    .unique(),
  ownerWalletAddress: varchar('owner_wallet_address', { length: 44 })
    .notNull()
    .references(() => users.walletAddress),
  treasuryAddress: varchar('treasury_address', { length: 44 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  website: varchar('website', { length: 500 }),
  twitter: varchar('twitter', { length: 100 }),
  discord: varchar('discord', { length: 100 }),
  totalEvents: integer('total_events').default(0).notNull(),
  totalStakedVolume: bigint('total_staked_volume', { mode: 'number' })
    .default(0)
    .notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
