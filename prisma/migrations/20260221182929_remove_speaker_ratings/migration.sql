/*
  Warnings:

  - You are about to drop the `speaker_ratings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "speaker_ratings" DROP CONSTRAINT "speaker_ratings_event_id_fkey";

-- DropForeignKey
ALTER TABLE "speaker_ratings" DROP CONSTRAINT "speaker_ratings_speaker_id_fkey";

-- DropTable
DROP TABLE "speaker_ratings";
