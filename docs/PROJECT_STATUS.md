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

- **2026-03-29**: Fixed HTTP 500 P2002 Unique Constraint errors when creating new records on Production.
  - Implemented a custom `Fix Production DB Sequences` GitHub Action to execute `SELECT setval()` for all Prisma tables on the `erp-upgrade.ru` PostgreSQL database. This resolves the auto-increment desynchronization caused by the legacy data import, which was preventing new speakers and other entities from being saved.
- **2026-03-29**: Fixed silent validation failures in `SafeDrawerForm`.
  - The submit button was occasionally failing to surface implicit validation errors (e.g. from hidden tabs/lists like `ProFormList` in `SessionDrawer`). Edited `SafeDrawerForm.tsx` to explicitly intercept the `submitter` click, forcefully invoke `validateFields()`, and surface any errors via an unsuppressable `notification.error` UI component indicating exactly which fields are missing.
- **2026-03-25**: Implemented "Smart Program Dates" logic for the Event Schedule Grid.
  -*   **Smart Program Dates (Dynamic Generation)** implementation completed. Program Editor dynamically generates date tabs based on `Event.startDate` and `Event.endDate`.
*   **Track Routing via Dropdown**: Restored `ProFormSelect` dropdown mapping `days` to `<TrackModal />`. Allowed explicit migration of tracks to active event days.
*   **Event Date Shrink Protection**: Implemented UI validation overlay that catches orphaned tracks recursively. **Fixed timezone shift bug** where saving the event dates late in the day locally shifted them to the previous/next day in UTC, breaking validation logic.
*   **Tilda Layout V2 Updates (v2 Old Layout)**: Fixed date anchoring, sorted chronological order of sidebar dates, removed hashtag (#N) display from tile grids, and fixed inline wrapping of hashtags in session detail lists.
*   **Track Routing Dropdown**: Enforces explicit mapping of tracks via `availableDays`. Tracks can be moved securely between event days.
- **2026-03-24**: Refactored the Tilda Integration UI (`/tilda-integration`). Introduced a `Segmented` control to generate widgets for Schedule, Speakers, and a Sponsors placeholder (Backlog).

- **2026-03-24**: Emergency Fix for Production Outage. Resolved a failed Prisma migration (`20260317181300_sync_missing_needs_call`) via a custom GitHub Action (`fix_prod_db.yml`). Successfully merged the CI update into the `production` branch and re-deployed, restoring `erp-upgrade.ru`.
- **2026-03-17**: Finalized Production Environment Synchronization. Developed custom native Node.js (`pg`) export/import scripts to cleanly migrate Data (Speakers & Event 76) without string formatting corruption from DevStand to Production, avoiding administrative overlap. Manually pushed missing Prisma migrations (`needs_call`) and instantiated `user_events` mappings in Prod. Synchronized the frontend UI by merging missing timeline grid width fixes and edit icon placement from `main` into the `production` branch.
- **2026-03-17**: Finalized Legacy Data Migration (PRD-12) by fixing the historical `SessionSpeaker` snapshot UI (`companySnapshot` and `positionSnapshot`). Documented the snapshot architecture and the seed parsing logic in `docs/analysis/session_speaker_model.md`. Addressed issues with incorrect speaker roles, missing snapshot mapping, and malformed question titles during DB seeding.
- **2026-03-17**: Fixed the production CI/CD workflow (`deploy-prod.yml`). Corrected the corrupted file format and updated the Certbot Let's Encrypt email registration parameter to use a valid `$DOMAIN_NAME` to prevent 3-minute failures and ensure SSL generation. Triggered a successful manual deployment to `erp-upgrade.ru`.
- **2026-03-17**: Fixed the Two-Tier CI/CD infrastructure for DevStand and Production deployments.
  - Resolved Nginx crash loops by passing `DOMAIN_NAME` into the `docker-compose.prod.yml` `frontend` container, allowing Nginx envsubst templating to construct the correct SSL paths and server blocks.
  - Rectified SSH Handshake errors in `deploy-prod.yml` by regenerating and adding the `PROD_SSH_PRIVATE_KEY` to GitHub Secrets.
  - Configured Docker Daemon Registry Mirrors (`mirror.gcr.io`, `dockerhub.timeweb.cloud`) in `/etc/docker/daemon.json` on the Production server (`erp-upgrade.ru`) to bypass `connection reset by peer` timeouts from Docker Hub.
- **2026-03-14**: Fixed speaker status and timestamp layout in `SessionDrawer.tsx` editor. The timestamp is now placed neatly under the status dropdown in a single column instead of floating incorrectly due to Flexbox.

- **2026-03-14**: Successfully extracted 188 speaker photographs from the legacy `spring.upgrade.st` Tilda grid (PRD-14) using the Visual Browser Subagent to bypass obfuscation and LazyLoading. Developed the `POST /api/speakers/sync-photos` DevStand backend route to dynamically ingest JSON payloads and hydrate the PostgreSQL DB natively over HTTP. Established the `/tilda_scraping_guide` workflow for future agents.
- **2026-03-12**: Fixed `413 Request Entity Too Large` error when uploading large files (e.g. PDF presentations) by increasing `client_max_body_size` to `50M` in the frontend Nginx configuration (`client/nginx.conf`).
- **2026-03-12**: Designed and implemented a comprehensive Infrastructure and Application Monitoring Solution. Added an "In-App System Status" page for admins (Frontend React + NestJS Terminus). Integrated a full prometheus + Grafana stack (`prometheus`, `grafana`, `node-exporter`, `cadvisor`) into `docker-compose.prod.yml` for deep infrastructure metrics tracking.
- **2026-03-12**: Established comprehensive E2E API and UI testing workflows on the DevStand. Created the `/e2e_devstand_ui` workflow.
- **2026-03-11**: Fixed critical silent failures in `SafeDrawerForm` and `SafeModalForm` where the "Save" (Сохранить) button was completely dropping the form payload due to a missing `onFinish` pass-down.
- **2026-03-09**: Refactored forms application-wide to use robust global error handling (`SafeDrawerForm`, `ErrorBoundary`) to prevent white-screen crashes on malformed data.

## 4. Backlog
*Deferred tasks and future architecture proposals are tracked here.*

- [ ] **Zero-Downtime Deployment (ZDD) / CI/CD Pipeline Overhaul**: Transition to a more robust deployment pipeline with isolated Staging, GitHub Environments holding approval, and Nginx-level container traffic switching to prevent deployment downtime. See proposal: `d:\UPGRADE\.agent\workflows_backup\zero_downtime_deployment_proposal.md`.
