DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sponsors" ADD COLUMN "assigned_manager_id" INTEGER';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    EXECUTE 'ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_assigned_manager_id_fkey" FOREIGN KEY ("assigned_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
