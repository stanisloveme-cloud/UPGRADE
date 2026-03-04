/*
  Warnings:

  - You are about to drop the column `market_segments` on the `sponsors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sponsors" DROP COLUMN "market_segments";

-- CreateTable
CREATE TABLE "market_segments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "parent_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_segments" (
    "sponsor_id" INTEGER NOT NULL,
    "market_segment_id" INTEGER NOT NULL,

    CONSTRAINT "sponsor_segments_pkey" PRIMARY KEY ("sponsor_id","market_segment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_segments_name_key" ON "market_segments"("name");

-- AddForeignKey
ALTER TABLE "market_segments" ADD CONSTRAINT "market_segments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "market_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_segments" ADD CONSTRAINT "sponsor_segments_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_segments" ADD CONSTRAINT "sponsor_segments_market_segment_id_fkey" FOREIGN KEY ("market_segment_id") REFERENCES "market_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
