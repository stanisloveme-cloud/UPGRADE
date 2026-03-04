# TZ: Агент 1 (Backend & API Foundation)

## Роль и Цель
Ты backend-ориентированный ИИ-агент. Твоя задача — реализовать фундамент базы данных и API для нового функционала "Глобальные Бренды" и "Интеграция Tilda" согласно PRD-11.

## Исходные данные
- Проект использует Nest.js + Prisma + PostgreSQL.
- PRD: `docs/prd/11_Brands_Library_and_Tilda_Integration_RU.md`

## Задачи

### 1. Изменение схемы базы данных (Prisma)
Модифицируй файл `prisma/schema.prisma` следующим образом:
* **Модель Sponsor**:
  * Сделай модель независимой от конкретного мероприятия (сущность глобального бренда).
  * Удали поля: `cfoPhone`, `cfoEmail`, `materialsLink`.
  * Добавь поля: 
    * `marketSegments JSON?` (для хранения массива выбранных сегментов).
    * `exportToWebsite Boolean @default(false)`
    * `logoFileUrl String?` 
  * Добавь связь многие-ко-многим с `Event`. Лучше использовать явную связующую таблицу `EventSponsor` (event_id, sponsor_id, created_at), чтобы мы могли отслеживать, когда бренд был привязан.
* **Модель SessionSpeaker**:
  * Добавь поле `exportToWebsite Boolean @default(true)` (по умолчанию включено, чтобы не сломать текущую логику).

**Важно:** После изменения схемы сгенерируй миграцию через `npx prisma migrate dev --name prd11_brands_and_export`. 
*Убедись, что миграция содержит `EXCEPTION` блоки, как мы делали в предыдущем фиксе, чтобы избежать падений статического парсера PostgreSQL.*

### 2. Backend CRUD API для Brands (Спонсоров)
* Обнови `SponsorsController` и `SponsorsService`.
* Реализуй классический CRUD для управления глобальными брендами (список всех брендов, создание, обновление, удаление).
* Обнови логику *привязки* бренда к мероприятию (добавление записи в `EventSponsor`).

### 3. Публичный API для сайта (Tilda)
* Создай новый контроллер `PublicEventsController` или расширь существующий.
* Эндпоинт: `GET /api/public/events/:id/website-data`
* Формат ответа должен содержать агрегированные и отфильтрованные данные для сайта:
  * **Sponsors**: Возвращать только те бренды, привязанные к этому `eventId`, у которых `exportToWebsite === true`. Интегрировать `marketSegments` и `logoFileUrl`.
  * **Schedule & Speakers**: Возвращать структуру сессий, но включать в неё только тех спикеров/модераторов, у которых `exportToWebsite === true` И статус равен "Подтвержден" (Confirmed) или "Предварительно подтвержден" (Preliminarily Confirmed).

## Ожидаемый результат
* Pull Request с измененной `schema.prisma`.
* Готовая, безопасная SQL-миграция.
* Работающие REST API эндпоинты в NestJS (покрытые базовыми обработчиками ошибок).
