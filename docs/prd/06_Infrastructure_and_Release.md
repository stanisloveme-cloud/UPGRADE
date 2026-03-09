PRD-006: Infrastructure & Release Policy
Version: 1.0
Status: Draft
Dependencies: All previous PRDs
1. Контекст и Цель
Цель: Обеспечить стабильный, воспроизводимый и безопасный процесс доставки кода (CI/CD) и управления инфраструктурой.
Принцип: "Infrastructure as Code" (IaC) — никаких ручных правок на сервере.
2. Целевая Архитектура (Single Node Monolith)
Для этапа MVP и первых внедрений используется архитектура "Все в одном".
graph TD
    User[Client Browser] -->|HTTPS : 443| Nginx[Nginx Proxy (Host)]
    User -->|HTTP : 80 (Redirects to HTTPS)| Nginx
    
    subgraph "Docker Network (Internal)"
        Nginx -->|Proxy Pass| Frontend[Frontend Container (Nginx Static, SSL)]
        Nginx -->|Proxy Pass /api| Backend[Backend Container (NestJS)]
        Backend -->|TCP : 5432| DB[PostgreSQL 15]
        Backend -->|TCP : 6379| Redis[Redis Cache for Sessions]
    end

    subgraph "Host Filesystem"
        DB -->|Mount| VolDB[/opt/upgrade/data/postgres/]
        Backend -->|Mount| VolFiles[/opt/upgrade/uploads/]
        Frontend -->|Mount /etc/letsencrypt (ro)| LetsEncrypt[/etc/letsencrypt on Host]
    end


2.1. Требования к Серверу
OS: Ubuntu 22.04 / 24.04 LTS.
CPU: Min 2 cores (Rec: 4 cores).
RAM: Min 4 GB (Rec: 8 GB).
Disk: NVMe SSD (Min 40 GB).
Software: Docker Engine, Docker Compose plugin, Git.
3. Релизная Политика (GitFlow)
Мы используем упрощенный GitHub Flow.
3.1. Ветки
main — Production. Всегда стабильна. Деплой происходит автоматически при пуше сюда.
develop (опционально) — Staging. Для тестов перед релизом.
feature/ABC-123 — Ветки разработки.
3.2. Правила именования коммитов (Conventional Commits)
Агент обязан следовать стандарту:
feat: add session editor
fix: resolve conflict in schedule
docs: update infrastructure guide
chore: update dependencies
4. Процесс Деплоя (CI/CD)
Используем GitHub Actions для автоматизации.
Pipeline: deploy.yml
Build: Сборка Docker-образов для Frontend и Backend.
Test: Запуск unit-тестов.
Push: Отправка образов в GitHub Container Registry (GHCR).
Deploy:
Подключение к серверу по SSH.
Установка/генерация SSL-сертификатов Let's Encrypt (Certbot) на хосте, если они отсутствуют.
Обновление crontab для автоматического продления сертификатов (pre-hook / post-hook для Nginx).
docker compose pull (скачивание новых образов).
docker compose up -d (перезапуск контейнеров).
docker system prune (очистка старого).

4.1. SSL & HTTPS (Let's Encrypt)
Управление сертификатами происходит на уровне хост-машины (Ubuntu):
Certbot (standalone) генерирует ключи в `/etc/letsencrypt/live/devupgrade.space4you.ru/`.
Фронтенд-контейнер (Nginx) монтирует эти ключи в режиме `ro` (read-only) и прослушивает порт 443.
Все HTTP запросы (порт 80) автоматически редиректятся Nginx'ом на HTTPS (301 Moved Permanently).
Продление сертификатов происходит автоматически через cron-задачу на хосте (`certbot renew`).
5. Инфраструктура проекта (File Structure)
**CRITICAL**: Структура проекта зафиксирована (Hard Coded Context). Изменения запрещены.

Корень проекта на сервере (`/opt/upgrade-crm` или `~/upgrade-crm`) и в репозитории:
```
/
├── docker-compose.yml       # Production конфиг (или docker-compose.prod.yml)
├── Dockerfile               # Backend Dockerfile (Multi-stage: NestJS)
├── package.json             # Backend dependencies
├── .env                     # Секреты (НЕ В GIT!)
├── src/                     # Исходный код Backend (NestJS)
├── prisma/                  # Схема БД и миграции
├── client/                  # Frontend Root
│   ├── Dockerfile           # Frontend Dockerfile (Multi-stage: Node->Nginx)
│   ├── nginx.conf           # Конфиг Nginx для SPA
│   ├── src/                 # Исходный код Frontend (React)
│   └── vite.config.ts
    └── workflows/
        └── deploy.yml       # CI/CD Pipeline
```
**Важно**: Папки `infra/` и `backend/` **ОТСУТСТВУЮТ**. Все инфраструктурные конфиги лежат в корне, исходный код бэкенда — в `src/`.


6. Резервное копирование (Backup Strategy)
Что: PostgreSQL база данных + папка uploads (файлы презентаций).
Как: Cron-скрипт каждую ночь (03:00).
Куда: Локальная папка + (опционально) выгрузка в S3/Yandex Object Storage.
7. Инструкции для разработчика (Agent Prompt)
Dockerize: Создай Dockerfile для NestJS (multistage build) и React (build -> nginx alpine).
Compose: Напиши docker-compose.yml, который поднимает App, DB, Redis. Настрой restart: always.
Nginx: Сгенерируй конфиг Nginx, который проксирует /api на бэкенд, а остальное на фронтенд.
CI/CD: Создай .github/workflows/deploy.yml шаблон.
