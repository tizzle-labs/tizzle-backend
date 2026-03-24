DO $$ BEGIN
 CREATE TYPE "public"."badge_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."badge_type" AS ENUM('organizer', 'attendee', 'special');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_pda" varchar(44) NOT NULL,
	"snapshot_time" timestamp NOT NULL,
	"total_registered" integer NOT NULL,
	"total_checked_in" integer NOT NULL,
	"total_refunded" integer NOT NULL,
	"tvl_amount" bigint NOT NULL,
	"attendance_rate" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"type" "badge_type" NOT NULL,
	"tier" "badge_tier" NOT NULL,
	"requirement" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(44) NOT NULL,
	"badge_id" uuid NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_pda" varchar(44) NOT NULL,
	"event_id" varchar(44) NOT NULL,
	"organization_pda" varchar(44) NOT NULL,
	"organizer_wallet_address" varchar(44) NOT NULL,
	"gatekeeper_address" varchar(44) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"location" varchar(255),
	"category" varchar(100),
	"tags" text,
	"capacity" integer NOT NULL,
	"stake_amount" bigint NOT NULL,
	"stake_token_mint" varchar(44) NOT NULL,
	"stake_token_symbol" varchar(10),
	"stake_token_decimals" integer DEFAULT 9,
	"host_fee_enabled" boolean DEFAULT false NOT NULL,
	"host_fee_percent" integer DEFAULT 0 NOT NULL,
	"platform_fee_paid" bigint NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"unlock_time" timestamp NOT NULL,
	"total_registered" integer DEFAULT 0 NOT NULL,
	"total_checked_in" integer DEFAULT 0 NOT NULL,
	"total_staked" bigint DEFAULT 0 NOT NULL,
	"total_refunded" integer DEFAULT 0 NOT NULL,
	"organizer_withdrawn" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_event_pda_unique" UNIQUE("event_pda")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(44) NOT NULL,
	"username" varchar(50),
	"email" varchar(255),
	"name" varchar(255),
	"bio" text,
	"avatar_url" varchar(500),
	"nonce" varchar(64) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_pda" varchar(44) NOT NULL,
	"owner_wallet_address" varchar(44) NOT NULL,
	"treasury_address" varchar(44) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"avatar_url" varchar(500),
	"website" varchar(500),
	"twitter" varchar(100),
	"discord" varchar(100),
	"total_events" integer DEFAULT 0 NOT NULL,
	"total_staked_volume" bigint DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_organization_pda_unique" UNIQUE("organization_pda")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_pda" varchar(44) NOT NULL,
	"event_pda" varchar(44) NOT NULL,
	"attendee_wallet_address" varchar(44) NOT NULL,
	"stake_amount" bigint NOT NULL,
	"checked_in" boolean DEFAULT false NOT NULL,
	"refunded" boolean DEFAULT false NOT NULL,
	"registered_at" timestamp NOT NULL,
	"checked_in_at" timestamp,
	"refunded_at" timestamp,
	"transaction_signature" varchar(88),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_pda_unique" UNIQUE("registration_pda")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_analytics" ADD CONSTRAINT "event_analytics_event_pda_events_event_pda_fk" FOREIGN KEY ("event_pda") REFERENCES "public"."events"("event_pda") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_organization_pda_organizations_organization_pda_fk" FOREIGN KEY ("organization_pda") REFERENCES "public"."organizations"("organization_pda") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_wallet_address_users_wallet_address_fk" FOREIGN KEY ("owner_wallet_address") REFERENCES "public"."users"("wallet_address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_pda_events_event_pda_fk" FOREIGN KEY ("event_pda") REFERENCES "public"."events"("event_pda") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registrations" ADD CONSTRAINT "registrations_attendee_wallet_address_users_wallet_address_fk" FOREIGN KEY ("attendee_wallet_address") REFERENCES "public"."users"("wallet_address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
