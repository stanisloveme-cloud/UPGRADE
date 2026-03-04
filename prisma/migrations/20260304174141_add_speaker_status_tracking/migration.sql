-- This is a manual hotfix migration to only add what's missing in prod and avoid the "already exists" errors.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='memo_template') THEN
        EXECUTE 'ALTER TABLE "events" ADD COLUMN "memo_template" TEXT';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='session_speakers' AND column_name='memo_hash') THEN
        EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "memo_hash" VARCHAR(36)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='session_speakers' AND column_name='notified_email') THEN
        EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "notified_email" BOOLEAN NOT NULL DEFAULT false';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='session_speakers' AND column_name='notified_tg') THEN
        EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "notified_tg" BOOLEAN NOT NULL DEFAULT false';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='session_speakers' AND column_name='status_user_id') THEN
        EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "status_user_id" INTEGER';
    END IF;
END $$;

-- Attempt to modify status_date to timestamptz (if not already)
ALTER TABLE "session_speakers" ALTER COLUMN "status_date" SET DATA TYPE TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='manager_id') THEN
        EXECUTE 'ALTER TABLE "sessions" ADD COLUMN "manager_id" INTEGER';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='material_link') THEN
        EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "material_link" VARCHAR(512)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='material_type') THEN
        EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "material_type" VARCHAR(100)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='ready_date') THEN
        EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "ready_date" DATE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='status') THEN
        EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "status" VARCHAR(50) NOT NULL DEFAULT ''planned''';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='can_manage_speakers') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "can_manage_speakers" BOOLEAN NOT NULL DEFAULT false';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "email" VARCHAR(255)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_name') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "first_name" VARCHAR(100)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_name') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "last_name" VARCHAR(100)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_token') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "reset_token" VARCHAR(255)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_token_expiry') THEN
        EXECUTE 'ALTER TABLE "users" ADD COLUMN "reset_token_expiry" TIMESTAMP(3)';
    END IF;
END $$;

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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsors' AND column_name='assigned_manager_id') THEN
        EXECUTE 'ALTER TABLE "sponsors" ADD COLUMN "assigned_manager_id" INTEGER';
    END IF;
END $$;

-- Note: We wrap index and foreign key creation in anonymous DO blocks so they don't fail if they already exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_events_user_id_event_id_key') THEN
        EXECUTE 'CREATE UNIQUE INDEX "user_events_user_id_event_id_key" ON "user_events"("user_id", "event_id")';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sponsors_approval_hash_key') THEN
        EXECUTE 'CREATE UNIQUE INDEX "sponsors_approval_hash_key" ON "sponsors"("approval_hash")';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'session_speakers_memo_hash_key') THEN
        EXECUTE 'CREATE UNIQUE INDEX "session_speakers_memo_hash_key" ON "session_speakers"("memo_hash")';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_email_key') THEN
        EXECUTE 'CREATE UNIQUE INDEX "users_email_key" ON "users"("email")';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users_reset_token_key') THEN
        EXECUTE 'CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token")';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sessions_manager_id_fkey') THEN
        EXECUTE 'ALTER TABLE "sessions" ADD CONSTRAINT "sessions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'session_speakers_status_user_id_fkey') THEN
        EXECUTE 'ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_status_user_id_fkey" FOREIGN KEY ("status_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_events_user_id_fkey') THEN
        EXECUTE 'ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_events_event_id_fkey') THEN
        EXECUTE 'ALTER TABLE "user_events" ADD CONSTRAINT "user_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sponsors_event_id_fkey') THEN
        EXECUTE 'ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'sponsors_assigned_manager_id_fkey') THEN
        EXECUTE 'ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_assigned_manager_id_fkey" FOREIGN KEY ("assigned_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
    END IF;
END $$;
