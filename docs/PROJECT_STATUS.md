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

- **2026-03-12**: Fixed two regressions found by E2E testing: (1) **Defect #1** — `HallsModal.tsx`: PATCH halls request sent `id` in the body, causing 400 from `forbidNonWhitelisted` ValidationPipe; fixed by destructuring `id` out of the payload. (2) **Defect #2** — `CreateSpeakerDto` contained `exportToWebsite` field absent from the `Speaker` Prisma model (it belongs to `SessionSpeaker`), causing Prisma crash → 500; removed the field from DTO, modal payload, and form UI. Commit: `fb9091dd`.
- **2026-03-12**: Established comprehensive E2E API and UI testing workflows on the DevStand. Created the `/e2e_devstand_ui` workflow.
- **2026-03-11**: Fixed critical silent failures in `SafeDrawerForm` and `SafeModalForm` where the "Save" (Сохранить) button was completely dropping the form payload due to a missing `onFinish` pass-down.
- **2026-03-09**: Refactored forms application-wide to use robust global error handling (`SafeDrawerForm`, `ErrorBoundary`) to prevent white-screen crashes on malformed data.
