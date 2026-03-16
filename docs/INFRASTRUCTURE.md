# Infrastructure & Deployment

This document contains critical information about the production environment.
**DO NOT COMMIT SECRETS (PASSWORDS, PRIVATE KEYS) TO GIT.**

## Servers & Environments
### 1. Pre-Prod (DevStand)
- **Domain:** `devupgrade.space4you.ru`
- **IP Address:** `72.56.101.48`
- **Deployment Trigger:** Push to `main` branch
- **SSH Variables (GitHub Secrets):** `SERVER_HOST`, `SERVER_USER`, `SSH_PRIVATE_KEY`

### 2. Production
- **Domain:** `<PROD_DOMAIN>` (Stored in `PROD_DOMAIN` secret)
- **IP Address:** `<PROD_IP>` (Stored in `PROD_SERVER_HOST` secret)
- **Deployment Trigger:** Push to `production` branch
- **SSH Variables (GitHub Secrets):** `PROD_SERVER_HOST`, `PROD_SERVER_USER`, `PROD_SSH_PRIVATE_KEY`

## Shared Software Stack
- **Docker:** v28.2.2
- **Docker Compose:** v2.37.1
- **Node.js:** v20.20.0
- **Database:** PostgreSQL 15 (Dockerized)

## Deployment Command
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Maintenance
- **Logs:** `docker-compose -f docker-compose.prod.yml logs -f`
- **Restart:** `docker-compose -f docker-compose.prod.yml restart`