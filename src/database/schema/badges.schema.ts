import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const badgeTypeEnum = pgEnum('badge_type', [
  'organizer',
  'attendee',
  'special',
]);
export const badgeTierEnum = pgEnum('badge_tier', [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
]);

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  type: badgeTypeEnum('type').notNull(),
  tier: badgeTierEnum('tier').notNull(),
  requirement: text('requirement').notNull(), // JSON stored as text
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userBadges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: varchar('wallet_address', { length: 44 }).notNull(),
  badgeId: uuid('badge_id')
    .notNull()
    .references(() => badges.id),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
  progress: integer('progress').default(0).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
