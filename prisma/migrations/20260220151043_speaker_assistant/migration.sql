-- AlterTable
ALTER TABLE "speakers" ADD COLUMN     "assistant_contact" VARCHAR(255),
ADD COLUMN     "assistant_name" VARCHAR(100),
ADD COLUMN     "has_assistant" BOOLEAN NOT NULL DEFAULT false;
