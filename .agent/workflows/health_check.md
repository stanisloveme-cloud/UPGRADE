---
description: Check if the development environment is healthy and running
---

# Health Check Workflow

Run this workflow to ensure all system components are active and communicating correctly.

## 1. Check Docker Containers (Database & Redis)
Ensure the database and cache services are running.
// turbo
1. Run `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
   - Look for `upgrade-db-1` (postgres) and `upgrade-redis-1`.
   - Status should be "Up".

## 2. Check Backend Connection
Verify the backend API is reachable and the database is accessible.
// turbo
2. Run `curl -v http://localhost:3000/api/health` (or check a simple endpoint like `/api/events`)
   - If this fails with `ECONNREFUSED`, the backend is not running.
   - If this returns 500, the database might be empty or unreachable.

## 3. Check Prerequisite Data (Seed)
If the backend is running but returning empty lists or 500s on main pages:
3. Run `npx prisma db seed` to populate necessary initial data.

## 4. Check Frontend
Ensure the frontend development server is active.
// turbo
4. Run `curl -I http://localhost:5173`
   - Should return HTTP 200.

## Troubleshooting
- **DB is down:** Run `docker-compose up -d`
- **Backend is down:** Run `npm run start:dev` in the server terminal.
- **Data is missing:** Run `npx prisma db seed`
