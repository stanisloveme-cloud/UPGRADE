DO $$ 
BEGIN
    -- Drop ForeignKey if exists
    BEGIN
        ALTER TABLE "sponsors" DROP CONSTRAINT "sponsors_event_id_fkey";
    EXCEPTION
        WHEN undefined_object THEN null;
    END;

    -- Add export_to_website to session_speakers
    BEGIN
        ALTER TABLE "session_speakers" ADD COLUMN "export_to_website" BOOLEAN NOT NULL DEFAULT true;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    -- Drop columns from sponsors
    BEGIN
        ALTER TABLE "sponsors" DROP COLUMN "cfo_email",
        DROP COLUMN "cfo_phone",
        DROP COLUMN "event_id",
        DROP COLUMN "materials_url";
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    -- Add columns to sponsors
    BEGIN
        ALTER TABLE "sponsors" ADD COLUMN "export_to_website" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN "logo_file_url" VARCHAR(512);
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    -- Create event_sponsors
    BEGIN
        CREATE TABLE "event_sponsors" (
            "event_id" INTEGER NOT NULL,
            "sponsor_id" INTEGER NOT NULL,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "event_sponsors_pkey" PRIMARY KEY ("event_id","sponsor_id")
        );
    EXCEPTION
        WHEN duplicate_table THEN null;
    END;

    -- AddForeignKey for event_sponsors (event_id)
    BEGIN
        ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;

    -- AddForeignKey for event_sponsors (sponsor_id)
    BEGIN
        ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;

END $$;
