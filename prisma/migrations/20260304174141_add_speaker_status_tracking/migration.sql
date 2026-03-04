-- This is a manual hotfix migration to only add what's missing in prod and avoid the "already exists" errors.

-- Attempt to add memo_template IF NOT EXISTS
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "memo_template" TEXT;

-- Attempt to add new session_speakers fields IF NOT EXISTS
ALTER TABLE "session_speakers" ADD COLUMN IF NOT EXISTS "memo_hash" VARCHAR(36);
ALTER TABLE "session_speakers" ADD COLUMN IF NOT EXISTS "notified_email" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "session_speakers" ADD COLUMN IF NOT EXISTS "notified_tg" BOOLEAN NOT NULL DEFAULT false;

-- Add the truly new field
ALTER TABLE "session_speakers" ADD COLUMN IF NOT EXISTS "status_user_id" INTEGER;

-- Attempt to modify status_date to timestamptz (if not already)
ALTER TABLE "session_speakers" ALTER COLUMN "status_date" SET DATA TYPE TIMESTAMPTZ;

-- Attempt to add new sessions fields IF NOT EXISTS
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "manager_id" INTEGER;

-- Attempt to add new tracks fields IF NOT EXISTS
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "material_link" VARCHAR(512);
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "material_type" VARCHAR(100);
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "ready_date" DATE;
ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) NOT NULL DEFAULT 'planned';

-- Attempt to add new users fields IF NOT EXISTS
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "can_manage_speakers" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token_expiry" TIMESTAMP(3);

-- Add tables IF NOT EXISTS
CREATE TABLE IF NOT EXISTS "user_events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sponsors" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_description" VARCHAR(255),
    "website_url" VARCHAR(255),
    "public_email" VARCHAR(100),
    "public_phone" VARCHAR(50),
    "logo_url" VARCHAR(512),
    "description" TEXT,
    "catalog_description" TEXT,
    "service_card_description" TEXT,
    "market_segments" JSONB,
    "city" VARCHAR(100),
    "employee_count" INTEGER,
    "annual_turnover" VARCHAR(100),
    "telegram" VARCHAR(100),
    "whatsapp" VARCHAR(100),
    "contact_name" VARCHAR(100),
    "contact_email" VARCHAR(100),
    "cfo_name" VARCHAR(100),
    "cfo_phone" VARCHAR(50),
    "cfo_email" VARCHAR(100),
    "cases" JSONB,
    "materials_url" VARCHAR(512),
    "approval_hash" VARCHAR(36),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_manager_id" INTEGER,
    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- Explicitly add columns to sponsors if the table already existed but was missing them
ALTER TABLE "sponsors" ADD COLUMN IF NOT EXISTS "assigned_manager_id" INTEGER;

-- Note: We wrap index and foreign key creation in anonymous DO blocks so they don't fail if they already exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_events_user_id_event_id_key') THEN
        CREATE UNIQUE INDEX "user_events_user_id_event_id_key" ON "user_events"("user_id", "event_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sponsors_approval_hash_key') THEN
        CREATE UNIQUE INDEX "sponsors_approval_hash_key" ON "sponsors"("approval_hash");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'session_speakers_memo_hash_key') THEN
        CREATE UNIQUE INDEX "session_speakers_memo_hash_key" ON "session_speakers"("memo_hash");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_email_key') THEN
        CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_reset_token_key') THEN
        CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessions_manager_id_fkey') THEN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'session_speakers_status_user_id_fkey') THEN
        ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_status_user_id_fkey" FOREIGN KEY ("status_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_events_user_id_fkey') THEN
        ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_events_event_id_fkey') THEN
        ALTER TABLE "user_events" ADD CONSTRAINT "user_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sponsors_event_id_fkey') THEN
        ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sponsors_assigned_manager_id_fkey') THEN
        ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_assigned_manager_id_fkey" FOREIGN KEY ("assigned_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
