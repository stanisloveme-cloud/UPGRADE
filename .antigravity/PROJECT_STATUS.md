# PROJECT STATUS
**Last Updated:** 2026-02-22
**Current Phase:** MVP DEPLOYED ✅ | Agent Infrastructure Ready ✅

---

## 1. Filesystem Truth (Hard Coded Context)
**CRITICAL**: This section overrides any external documentation (PRD).
- **ROOT**: Contains `docker-compose.prod.yml`, `Dockerfile`, `package.json`. This is the Backend Root.
- **BACKEND**: Code located in `./src` (NestJS) and `./prisma`.
- **FRONTEND**: Located in `./client` (Vite + React + Ant Design v5).
- **INFRA**: **DOES NOT EXIST** as a folder. All infrastructure configs are in **ROOT**.
- **CI/CD**: `.github/workflows/deploy.yml` — SSH deploy via appleboy/ssh-action.
- **SCRIPTS**: `scripts/check_deploy.js`, `scripts/trigger_deploy.js` — use these via `node scripts/...` to monitor GitHub Actions without a browser.

---

## 2. Production Environment
- **Frontend**: http://devupgrade.space4you.ru (HTTP 200 ✅ confirmed 2026-02-22)
- **Backend**: http://devupgrade.space4you.ru/api
- **Server**: Cloud NL-50 — 2 × 3.3 GHz CPU, **4 GB RAM**, 50 GB NVMe
- **Docker Hub**: `stanisloveme-cloud/upgrade-backend:latest`, `stanisloveme-cloud/upgrade-frontend:latest`
- **CI/CD**: GitHub Actions — `.github/workflows/deploy.yml` (fully automated on push to `main`)

---

## 3. Completed Work — Session 2026-02-21 → 2026-02-22

### UI Fixes
- [x] **ScheduleGrid z-index overlap**: Fixed sticky header layering — `TimeScale.tsx` (`zIndex: 10/5`, `top: 0`), `HallRow.tsx` (`zIndex: 2`).
- [x] **Speaker photo upload**: Replaced plain text input with `antd-img-crop` + `Upload` component (circular crop, avatar preview, delete button). Endpoint: `POST /api/uploads/speaker-photo`.

### Feature
- [x] **October 22nd data**: Added Day 2 tracks + sessions to `prisma/seed.ts` for UI day-switching.

### Security
- [x] **Speaker Ratings REMOVED**: Completely deleted `SpeakerRating` model from `prisma/schema.prisma`, `SpeakerHistory.tsx`, all seed data, and related migrations. Reason: privacy/security risk.

### Infrastructure — CI/CD Pipeline Fix (The Full Story)
Production deployment was broken through 7 consecutive failed runs. Root causes resolved in order:

| Run | Commit | Root Cause | Fix |
|-----|--------|------------|-----|
| #63 | — | Unused TS imports in `SessionDrawer.tsx` (TS6133 build error) | Removed unused dnd-kit imports |
| #64 | `8595c0f` | `npm ci` ran as non-root `node` USER in Dockerfile (no write access to `node_modules`) | Run `npm ci` as root before `USER node` |
| #65–#67 | `7a0dfa3` | `docker compose exec -T app npx prisma migrate deploy` → exit 137 (SIGKILL after ~12s) | See below |
| **#68** | `ce2e680` | **FINAL FIX**: `docker compose exec` spawns a second Node.js process inside the container, which gets SIGKILL'd by the OS in ~12 seconds regardless of memory limits | Moved migrations to `PrismaService.onModuleInit` (runs in-process on app startup). Removed `migrate deploy` and `db seed` from SSH script entirely. |

**Key learnings:**
- Exit 137 was NOT OOM (server has 4 GB RAM). It was a `docker exec` process being killed by the container runtime.
- `setup_infra.yml` workflow (creates swap) ran successfully but was irrelevant — the server had plenty of RAM.
- Memory limit `512M → 1G` in `docker-compose.prod.yml` also did not help — wrong hypothesis.
- **The correct fix**: migrations must run in-process (inside the already-running NestJS app), not via `docker compose exec`.

### Backend — Auto-Migration on Startup
- [x] `src/prisma/prisma.service.ts` — `onModuleInit` now runs `npx prisma migrate deploy` via `child_process.exec` with a 60s timeout. Errors are caught and logged as warnings (safe for re-deploys where migrations are already applied).

---

## 4. Current Architecture State

### Backend (`./src`)
- NestJS with Prisma 7 + `@prisma/adapter-pg` (required for Prisma 7 — standard `datasourceUrl` is deprecated)
- Modules: Events, Halls, Tracks, Sessions, Speakers, Auth (JWT), Users, Uploads, Exports, Notifications
- Global JWT guard via `APP_GUARD`
- Migrations auto-run on startup via `PrismaService.onModuleInit`

### Frontend (`./client`)
- React 18 + Vite + Ant Design v5 + Zustand
- Auth: JWT stored in `localStorage`, React Context for state
- ScheduleGrid: CSS Grid, sticky headers (z-index layered)
- Speaker management: antd-img-crop for circular photo upload

### Infrastructure
- Docker: multi-stage builds for both backend and frontend
- `docker-compose.prod.yml`: app (1G limit), frontend (128M), db postgres:15-alpine (256M)
- CI/CD: push to `main` → GitHub Actions builds images → pushes to Docker Hub → SSH deploys to server
- **NO git on production server** — compose config written via heredoc from CI

---

## 5. Known Issues / Next Steps

### Known Issues
- **Event ID mismatch**: URL may use a different event ID than the DB. User is aware. Investigate after stable deploy.
- **`prisma db seed`**: Removed from CI — seed data must be run manually if DB is reset. Command: `docker compose exec app npx prisma db seed` (run from server, or re-add to CI as a one-time workflow_dispatch).
- **Redis orphan**: CI logs show `upgrade-crm-redis-1` orphan container warning. Redis is not in `docker-compose.prod.yml` (was removed earlier). Should add `--remove-orphans` flag to `docker compose up`.

### Next Steps
- [ ] Add `--remove-orphans` to `docker compose up -d` in `deploy.yml`
- [ ] Seed data strategy: decide if seed runs on first deploy only, or always (make it idempotent with upsert)
- [ ] Verify application functionality end-to-end at http://devupgrade.space4you.ru
- [ ] Continue feature development: Session editing, Speaker management polish

---

## 6. Agent Constraints & Tooling

### Shell
- **Git Bash** is the default shell. Use standard Linux commands (`ls`, `cat`, `grep`, `git`).
- **NEVER run blocking commands** (`npm run start:dev`, `docker compose up` without `-d`) — ask user to run in separate terminal.

### GitHub API
- Use `node scripts/check_deploy.js` to check latest deployment status (reads from `.env` GITHUB_TOKEN).
- Use `node scripts/trigger_deploy.js` to trigger a new deploy.
- Use `gh run view <ID> --log` / `--log-failed` to read raw CI logs.

### Path Truth
- Frontend: `./client` (NOT `/frontend`)
- Backend: `./src` (NOT `/backend`)
- Infra: root `./` (NOT `/infra`)
