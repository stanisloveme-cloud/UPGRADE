# UPGRADE CRM: Project Tracker & Status

**Living Document**: This file serves as the Single Source of Truth for the current development phase of UPGRADE CRM.
**Current Phase:** MVP DEPLOYED (March 2026). Currently in the `Change Request & Maintenance` phase.

> **CRITICAL INSTRUCTION FOR ALL AGENTS:** 
> Before finishing any session or task where you have successfully deployed a feature or fixed a bug, **you MUST update the "Change Log (Post-MVP)" section below**. Add a new bullet point describing what you successfully implemented, so the next agent knows what was done.

---

## 1. Environment & Architecture
- **Frontend**: `./client` (Vite + React + Ant Design v5)
- **Backend**: `./src` (NestJS) and `./prisma` (PostgreSQL 15+)
- **Testing**: `./e2e` (Playwright UI & API auto-tests)
- **Production Server**: `devupgrade.space4you.ru` (Linux VPS, Docker Compose)
- **Deploy Trigger**: Pushing to the `main` branch on GitHub automatically deploys to the DevStand.

## 2. Completed Milestones (MVP)
The following core Business Data requirements have been fully analyzed, implemented, and deployed to DevStand:
- [x] Initial Architecture & DB Schema (PRD-001)
- [x] UI Skeleton & Halls Management (PRD-002)
- [x] The Grid (Schedule rendering) (PRD-003)
- [x] Session Editor & Constraints (PRD-004)
- [x] RBAC & Admin Seeding (PRD-007)
- [x] Speaker Data Model (PRD-008)
- [x] Yandex SMTP Email Integration (PRD-009)
- [x] Brands Library & Logo Uploads (PRD-11)
- [x] Legacy Data Migration (PRD-12)

## 3. Change Log (Post-MVP)
*Agents: Add your completed tasks here in reverse chronological order (newest at the top).*

- **2026-03-14**: Fixed DevStand `500 Internal Server Error` on the `/api/events` endpoint. The previous agent created a manual migration mapping to the `"Event"` table instead of the `"events"` table, causing a Prisma client mismatch that silently bricked the events module. Wrote a surgical hotfix into `PrismaService` to `prisma migrate resolve --rolled-back` the failed migration on production before automatically deploying the corrected SQL file.

- **2026-03-14**: Fixed speaker status and timestamp layout in `SessionDrawer.tsx` editor. The timestamp is now placed neatly under the status dropdown in a single column instead of floating incorrectly due to Flexbox.

- **2026-03-14**: Successfully extracted 188 speaker photographs from the legacy `spring.upgrade.st` Tilda grid (PRD-14) using the Visual Browser Subagent to bypass obfuscation and LazyLoading. Developed the `POST /api/speakers/sync-photos` DevStand backend route to dynamically ingest JSON payloads and hydrate the PostgreSQL DB natively over HTTP. Established the `/tilda_scraping_guide` workflow for future agents.
- **2026-03-12**: Fixed `413 Request Entity Too Large` error when uploading large files (e.g. PDF presentations) by increasing `client_max_body_size` to `50M` in the frontend Nginx configuration (`client/nginx.conf`).
- **2026-03-12**: Designed and implemented a comprehensive Infrastructure and Application Monitoring Solution. Added an "In-App System Status" page for admins (Frontend React + NestJS Terminus). Integrated a full prometheus + Grafana stack (`prometheus`, `grafana`, `node-exporter`, `cadvisor`) into `docker-compose.prod.yml` for deep infrastructure metrics tracking.
- **2026-03-12**: Established comprehensive E2E API and UI testing workflows on the DevStand. Created the `/e2e_devstand_ui` workflow.
- **2026-03-11**: Fixed critical silent failures in `SafeDrawerForm` and `SafeModalForm` where the "Save" (Сохранить) button was completely dropping the form payload due to a missing `onFinish` pass-down.
- **2026-03-09**: Refactored forms application-wide to use robust global error handling (`SafeDrawerForm`, `ErrorBoundary`) to prevent white-screen crashes on malformed data.