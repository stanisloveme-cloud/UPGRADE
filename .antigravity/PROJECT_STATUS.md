# PROJECT STATUS
**Last Updated:** 2026-02-17
**Current Phase:** SYSTEM MAINTENANCE / RECOVERY

## 1. Filesystem Truth (Hard Coded Context)
**CRITICAL**: This section overrides any external documentation (PRD).
- **ROOT**: Contains `docker-compose.yml`, `Dockerfile`, `package.json`. This is the Backend Root.
- **BACKEND**: Code located in `./src` (NestJS) and `./prisma`.
- **FRONTEND**: Located in `./client` (Vite + React).
- **INFRA**: **DOES NOT EXIST**. All infrastructure configs are in **ROOT**.
- **CI/CD**: `.github` folder is **MISSING**.

## 2. Discrepancies (PRD vs Reality)
- **Infrastructure**:
  - PRD Requirement: `/infra` folder.
  - **Reality**: Root directory.
- **Backend Location**:
  - PRD Requirement: `/backend` folder.
  - **Reality**: Root directory (source in `./src`).

## 3. Recovery Plan Action Items
- [ ] **CI/CD**: Generate `.github/workflows/deploy.yml` using correct paths.
- [ ] **Documentation**: Update PRD to match filesystem (Do not move files).
- [ ] **Frontend**: Verify `client/Dockerfile` exists and works with context `./client`.
