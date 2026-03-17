-- AlterTable
ALTER TABLE "session_speakers" DROP COLUMN "needs_zoom",
ADD COLUMN     "call_link" VARCHAR(512),
ADD COLUMN     "needs_call" BOOLEAN NOT NULL DEFAULT false;

