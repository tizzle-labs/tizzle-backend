import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  bigint,
  boolean,
} from 'drizzle-orm/pg-core';
import { events } from './events.schema';
import { users } from './users.schema';

export const registrations = pgTable('registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  registrationPda: varchar('registration_pda', { length: 44 })
    .notNull()
    .unique(),
  eventPda: varchar('event_pda', { length: 44 })
    .notNull()
    .references(() => events.eventPda),
  attendeeWalletAddress: varchar('attendee_wallet_address', { length: 44 })
    .notNull()
    .references(() => users.walletAddress),
  stakeAmount: bigint('stake_amount', { mode: 'number' }).notNull(),
  checkedIn: boolean('checked_in').default(false).notNull(),
  refunded: boolean('refunded').default(false).notNull(),
  registeredAt: timestamp('registered_at').notNull(),
  checkedInAt: timestamp('checked_in_at'),
  refundedAt: timestamp('refunded_at'),
  transactionSignature: varchar('transaction_signature', { length: 88 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
