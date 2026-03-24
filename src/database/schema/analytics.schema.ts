import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  bigint,
} from 'drizzle-orm/pg-core';
import { events } from './events.schema';

export const eventAnalytics = pgTable('event_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventPda: varchar('event_pda', { length: 44 })
    .notNull()
    .references(() => events.eventPda),
  snapshotTime: timestamp('snapshot_time').notNull(),
  totalRegistered: integer('total_registered').notNull(),
  totalCheckedIn: integer('total_checked_in').notNull(),
  totalRefunded: integer('total_refunded').notNull(),
  tvlAmount: bigint('tvl_amount', { mode: 'number' }).notNull(),
  attendanceRate: integer('attendance_rate').notNull(), // Percentage * 100
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type EventAnalytics = typeof eventAnalytics.$inferSelect;
export type NewEventAnalytics = typeof eventAnalytics.$inferInsert;
