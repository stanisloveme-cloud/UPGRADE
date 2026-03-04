-- This is a manual hotfix migration to only add what's missing in prod and avoid the "already exists" errors.

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "events" ADD COLUMN "memo_template" TEXT';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "memo_hash" VARCHAR(36)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "notified_email" BOOLEAN NOT NULL DEFAULT false';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "notified_tg" BOOLEAN NOT NULL DEFAULT false';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "session_speakers" ADD COLUMN "status_user_id" INTEGER';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "session_speakers" ALTER COLUMN "status_date" SET DATA TYPE TIMESTAMPTZ';
EXCEPTION
    WHEN undefined_column THEN
        -- Handle case if table/column does not exist yet gracefully, or ignore
        NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "material_link" VARCHAR(512)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "material_type" VARCHAR(100)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "ready_date" DATE';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "tracks" ADD COLUMN "status" VARCHAR(50) NOT NULL DEFAULT ''planned''';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "can_manage_speakers" BOOLEAN NOT NULL DEFAULT false';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "email" VARCHAR(255)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "first_name" VARCHAR(100)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "last_name" VARCHAR(100)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "reset_token" VARCHAR(255)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "users" ADD COLUMN "reset_token_expiry" TIMESTAMP(3)';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add tables IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_events') THEN
        EXECUTE 'CREATE TABLE "user_events" (
            "id" SERIAL NOT NULL,
            "user_id" INTEGER NOT NULL,
            "event_id" INTEGER NOT NULL,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
        )';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sponsors') THEN
        EXECUTE 'CREATE TABLE "sponsors" (
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
            "status" VARCHAR(50) NOT NULL DEFAULT ''pending'',
            "rejection_reason" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "assigned_manager_id" INTEGER,
            CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
        )';
    END IF;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sessions" ADD COLUMN "manager_id" INTEGER';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sponsors" ADD COLUMN "assigned_manager_id" INTEGER';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Note: We wrap index and foreign key creation in anonymous DO blocks so they don't fail if they already exist.
DO $$
BEGIN
    EXECUTE 'CREATE UNIQUE INDEX "user_events_user_id_event_id_key" ON "user_events"("user_id", "event_id")';
EXCEPTION
    WHEN duplicate_table THEN NULL; -- indexes throw duplicate_table or duplicate_object
END $$;

DO $$
BEGIN
    EXECUTE 'CREATE UNIQUE INDEX "sponsors_approval_hash_key" ON "sponsors"("approval_hash")';
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'CREATE UNIQUE INDEX "session_speakers_memo_hash_key" ON "session_speakers"("memo_hash")';
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'CREATE UNIQUE INDEX "users_email_key" ON "users"("email")';
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token")';
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sessions" ADD CONSTRAINT "sessions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_status_user_id_fkey" FOREIGN KEY ("status_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "user_events" ADD CONSTRAINT "user_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_assigned_manager_id_fkey" FOREIGN KEY ("assigned_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
