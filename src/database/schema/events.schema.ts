import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  bigint,
  boolean,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventPda: varchar('event_pda', { length: 44 }).notNull().unique(),
  eventId: varchar('event_id', { length: 44 }).notNull(),
  organizationPda: varchar('organization_pda', { length: 44 })
    .notNull()
    .references(() => organizations.organizationPda),
  organizerWalletAddress: varchar('organizer_wallet_address', {
    length: 44,
  }).notNull(),
  gatekeeperAddress: varchar('gatekeeper_address', { length: 44 }).notNull(),

  // Event details
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  venueImageUrl: varchar('venue_image_url', { length: 500 }),
  location: varchar('location', { length: 255 }),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  category: varchar('category', { length: 100 }),
  tags: text('tags'), // JSON array stored as text

  // Blockchain data
  capacity: integer('capacity').notNull(),
  stakeAmount: bigint('stake_amount', { mode: 'number' }).notNull(),
  stakeTokenMint: varchar('stake_token_mint', { length: 44 }).notNull(),
  stakeTokenSymbol: varchar('stake_token_symbol', { length: 10 }),
  stakeTokenDecimals: integer('stake_token_decimals').default(9),
  hostFeeEnabled: boolean('host_fee_enabled').default(false).notNull(),
  hostFeePercent: integer('host_fee_percent').default(0).notNull(),
  platformFeePaid: bigint('platform_fee_paid', { mode: 'number' }).notNull(),

  // Timestamps
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  unlockTime: timestamp('unlock_time').notNull(),

  // Metrics
  totalRegistered: integer('total_registered').default(0).notNull(),
  totalCheckedIn: integer('total_checked_in').default(0).notNull(),
  totalStaked: bigint('total_staked', { mode: 'number' }).default(0).notNull(),
  totalRefunded: integer('total_refunded').default(0).notNull(),
  organizerWithdrawn: boolean('organizer_withdrawn').default(false).notNull(),

  // Metadata
  isPublished: boolean('is_published').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
