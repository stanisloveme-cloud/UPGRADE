# PROJECT STATUS
**Last Updated:** 2026-02-24
**Current Phase:** MVP DEPLOYED ✅

---

> [!IMPORTANT]
> **AGENT STARTUP INSTRUCTIONS:** 
> Before writing code or running shell commands, you **MUST** read `d:\UPGRADE\.antigravityrules` for strict architectural and tooling constraints (especially regarding Git and MCP).

---

## 1. Project Truth (Hard Coded Context)
- **Frontend**: `./client` (Vite + React + Ant Design v5)
- **Backend**: `./src` (NestJS) and `./prisma`
- **Infrastructure**: All configs (`docker-compose.prod.yml`, `Dockerfile`) are in the **ROOT** directory. There is NO `/infra` folder.

## 2. Production Environment
- **Server**: Cloud NL-50 — 2 × 3.3 GHz CPU, **4 GB RAM**, 50 GB NVMe
- **Frontend URL**: http://devupgrade.space4you.ru
- **Backend URL**: http://devupgrade.space4you.ru/api
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) — auto-deploys on push to `main`

## 3. Completed Work (Stabilization Sprint - 2026-02-24)
- [x] **Rules Audit & Unification**: Merged all conflicting rule files (`project_rules.yaml`) into a single source of truth (`.antigravityrules`).
- [x] **OOM Kills Fix (Node.js)**: Configured V8 Engine heap limits (`NODE_OPTIONS=--max-old-space-size=384`) in Docker Compose to strictly map to container memory constraints.
- [x] **Optimization**: Validated multi-stage build in `Dockerfile` and updated `.dockerignore` to prevent shipping redundant `.log`/`.txt` files into the context.
- [x] **Cleanup**: Removed unused Redis container completely from development stack.

## 4. Bug Fixes (UI & Uploads Sprint - 2026-02-25)
- [x] **Strict DTO Payload Fix**: Solved `400 Bad Request` silently failing save requests in Speaker and Session modals by separating URL params (e.g. `id`) from the HTTP JSON body payload.
- [x] **Avatar Upload Pipeline**: Resolved 500 crashes and 404 missing image errors by migrating `ServeStaticModule` away from legacy NestJS wildcard syntax and changing `__dirname` relative roots to `process.cwd()` to securely align with Docker volume persistence logic.

## 5. Immediate Next Steps (Current Focus)
- Awaiting next feature requests.
