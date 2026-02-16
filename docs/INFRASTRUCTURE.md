# Infrastructure & Deployment

This document contains critical information about the production environment.
**DO NOT COMMIT SECRETS (PASSWORDS, PRIVATE KEYS) TO GIT.**

## Server Details
- **IP Address:** `72.56.101.48`
- **User:** `root`
- **SSH Key Algorithm:** `ed25519`
- **Project Path:** `/opt/upgrade-crm/`
- **OS:** Ubuntu 24.04.4 LTS

## Domain & DNS
- **Domain:** `devupgrade.space4you.ru`
- **DNS Record:** A Record pointing to `72.56.101.48`
- **Port:** 3000 (HTTP)

## Software Stack
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
