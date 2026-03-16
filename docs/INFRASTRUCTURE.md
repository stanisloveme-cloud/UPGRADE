# Infrastructure & Deployment

This document contains critical information about the production environment.
**DO NOT COMMIT SECRETS (PASSWORDS, PRIVATE KEYS) TO GIT.**

## Server Details

### Pre-Prod (DevStand)
- **IP Address:** `72.56.101.48`
- **User:** `root`
- **SSH Key Algorithm:** `ed25519`
- **Project Path:** `/root/upgrade-crm/`
- **Domain:** `devupgrade.space4you.ru`

### Production (Prod)
- **IP Address:** `5.42.117.106`
- **User:** `root`
- **SSH Key Algorithm:** `ed25519`
- **Project Path:** `/root/upgrade-crm/`
- **Domain:** `erp-upgrade.ru`

## Software Stack
- **Docker:** v28.2.2 (v24+ on Prod)
- **Docker Compose:** v2.37.1 (v5+ on Prod)
- **Node.js:** v20.20.0
- **Database:** PostgreSQL 15 (Dockerized)

## Deployment

Деплой разделен на два независимых контура:
1. **Pre-Prod:** Автоматически по пушу в `main` (`.github/workflows/deploy-dev.yml`).
2. **Production:** Запускается вручную через кнопку Workflow Dispatch (`.github/workflows/deploy-prod.yml`), до внедрения автоматического деплоя из ветки `production`.

## Maintenance
- **Logs:** `docker compose -f docker-compose.prod.yml logs -f`
- **Restart:** `docker compose -f docker-compose.prod.yml restart`