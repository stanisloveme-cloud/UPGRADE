-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "SpeakerRole" AS ENUM ('moderator', 'speaker');

-- CreateEnum
CREATE TYPE "SpeakerStatus" AS ENUM ('confirmed', 'pre_confirmed', 'contact', 'to_contact', 'declined', 'review');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('planned', 'onsite', 'missing');

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halls" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "halls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" SERIAL NOT NULL,
    "hall_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "day" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "track_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "comments" TEXT,
    "clients" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "company" VARCHAR(255),
    "position" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "telegram" VARCHAR(100),
    "photo_url" VARCHAR(512),
    "is_sponsor" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "internal_comment" TEXT,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_speakers" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "speaker_id" INTEGER NOT NULL,
    "role" "SpeakerRole" NOT NULL DEFAULT 'speaker',
    "status" "SpeakerStatus" NOT NULL DEFAULT 'review',
    "status_date" DATE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "needs_zoom" BOOLEAN NOT NULL DEFAULT false,
    "has_presentation" BOOLEAN NOT NULL DEFAULT false,
    "manager_comment" TEXT,
    "program_thesis" TEXT,
    "newsletter_quote" TEXT,
    "presence_status" "PresenceStatus",

    CONSTRAINT "session_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_questions" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,

    CONSTRAINT "session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "briefings" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "moderator_id" INTEGER,
    "datetime" TIMESTAMPTZ NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "link" VARCHAR(512),
    "comment" TEXT,

    CONSTRAINT "briefings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_speakers_session_id_speaker_id_key" ON "session_speakers"("session_id", "speaker_id");

-- AddForeignKey
ALTER TABLE "halls" ADD CONSTRAINT "halls_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_hall_id_fkey" FOREIGN KEY ("hall_id") REFERENCES "halls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_speakers" ADD CONSTRAINT "session_speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speakers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "speakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
