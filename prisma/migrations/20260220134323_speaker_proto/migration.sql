-- AlterTable
ALTER TABLE "session_speakers" ADD COLUMN     "company_snapshot" VARCHAR(255),
ADD COLUMN     "position_snapshot" VARCHAR(255),
ADD COLUMN     "presentation_title" VARCHAR(255),
ADD COLUMN     "presentation_url" VARCHAR(512);

-- CreateTable
CREATE TABLE "speaker_ratings" (
    "id" SERIAL NOT NULL,
    "speaker_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "rated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaker_ratings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "speaker_ratings" ADD CONSTRAINT "speaker_ratings_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speaker_ratings" ADD CONSTRAINT "speaker_ratings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
