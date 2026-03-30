# Деплой и инфраструктура: Диагностика и статус передачи (Handover)

Документ описывает текущее состояние разделения CI/CD на Dev и Prod контуры, возникшие ошибки при деплое и примененные фиксы. Предназначен для следующего агента / разработчика.

## 1. Что было сделано (Архитектурные изменения)

Была поставлена задача настроить Production сервер (`5.42.117.106`, `erp-upgrade.ru`) изолированно от DevStand сервера (`devupgrade.space4you.ru`).

Для этого:
1. **GitHub Actions**: Старый `.github/workflows/deploy.yml` удален. Созданы два независимых флоу:
    - `.github/workflows/deploy-dev.yml` — реагирует на push в `main`, деплоит на DevStand.
    - `.github/workflows/deploy-prod.yml` — временно (для безопасности) работает только по `workflow_dispatch` (ручному триггеру), деплоит на Prod-сервер.
2. **Nginx (Frontend)**: Файл `client/nginx.conf` параметризован. Все хардкоды доменов заменены на `${DOMAIN_NAME}`.
3. **Frontend Dockerfile**: `client/Dockerfile` изменен так, что конфиг `nginx.conf` копируется в `/etc/nginx/templates/default.conf.template`. Это позволяет стандартному Nginx-контейнеру (с версии 1.19) автоматически вызывать `envsubst` при старте и заменять переменные окружения в шаблоне.
4. **Docker Compose**: В `docker-compose.prod.yml` переменная `FRONTEND_URL` бекенда теперь использует `https://${DOMAIN_NAME}`.

## 2. Что пошло не так (Диагностика сбоя)

Сразу после пуша в `main`, запустился `deploy-dev.yml` для Dev-стенда. Сборка прошла успешно, но после скачивания новых образов на сервер, **frontend-контейнер начал циклически перезапускаться (restarting)**, что привело к недоступности и Dev, и Prod (оба опираются на конфигурацию `docker-compose.prod.yml` из ветки `main`/`production`).

**Причина падения:**
В конфигурации `docker-compose.prod.yml` сервису `frontend` **НЕ** была передана переменная `DOMAIN_NAME` внутри секции `environment`. 
Из-за этого Nginx при запуске:
1. Пытался выполнить `envsubst` на шаблоне `default.conf.template`.
2. Видел незаполненную переменную `${DOMAIN_NAME}`.
3. Падал с ошибкой конфигурации, так как серверные имена и пути к SSL сертификатам оставались пустыми.

## 3. Внедренный фикс

Ветви `main` и `production` были обновлены (прямым коммитом через MCP).
В `docker-compose.prod.yml` была добавлена передача переменной в контейнер:

```yaml
  frontend:
    image: ${DOCKER_USERNAME}/upgrade-frontend:latest
    ports:
      - '80:80'
      - '443:443'
    environment:                 # <--- ДОБАВЛЕНО
      - DOMAIN_NAME=${DOMAIN_NAME} # <--- ДОБАВЛЕНО
    depends_on:
      - app
```

## 4. Следующие шаги для нового агента

1. **Проверить пайплайны на GitHub**: Изменения запушены. Github Actions `deploy-dev.yml` должен был запуститься заново (commit `fix(ci): pass DOMAIN_NAME to frontend container to fix nginx templating` на ветке `main`). Необходимо дождаться зелёной галочки и проверить работоспособность `https://devupgrade.space4you.ru`.
2. **Запуск Production**: Если Dev поднялся успешно, перейдите в ветку `production`, убедитесь, что коммит с фиксом в ней присутствует (он уже должен быть там), и запустите `Deploy to Production` workflow вручную (workflow dispatch), выбрав ветку `production`.
3. **Мониторинг Prod сервера**: Пайплайн попытается сгенерировать SSL-сертификаты с помощью Certbot для `erp-upgrade.ru` и запустить Nginx. Убедитесь, что логи Certbot (внутри action'а) успешны.

> Все логины, IP и команды (включая работу с Certbot) уже прописаны внутри `deploy-prod.yml`.