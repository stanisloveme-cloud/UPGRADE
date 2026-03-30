# Техническое Задание: Миграция `ProgramEditor` на CDD (Contract-Driven Development) архитектуру

## Контекст и Цель (Context & Objective)
В рамках глобальной стратегии (ADR 005) по переходу проекта на строгую контракторию API (через автогенерируемые хуки Orval поверх OpenAPI), необходимо перевести центральный и самый сложный модуль фронтенда — `client/src/pages/ProgramEditor`.

**Текущее состояние:**
Модуль Редактора Расписания плотно завязан на устаревшие нетипизированные вызовы `axios`. Из-за этого при изменении бэкенд-схемы фронтенд-код "молчаливо" ломается.
**Цель для Нового Агента:**
Вырезать все вызовы `axios` внутри папки `ProgramEditor` и внедрить мутации и запросы React Query (Orval), сгенерированные в `client/src/api/generated/`.

---

## 🛑 Критические Зоны и Риски (Обязательно к прочтению)

### 1. Архитектурная особенность кастомного инстанса Axios
Сгенерированные хуки `Orval` используют наш пропатченный инстанс axios.
🚨 **ВАЖНОЕ ВНИМАНИЕ АГЕНТУ:** В предыдущих миграциях (Спикеры, Спонсоры) была выявлена проблема деструктуризации ответов. Наш бэкенд (или interceptor) возвращает готовый объект, поэтому когда вы пишете `const { data: { data: sessions } } = useEventsController...` — это **часто приводит к `undefined`**, если данные лежат просто в стейте `data`. Всегда проверяйте консоль и структуру ответа перед деструктуризацией!

### 2. Сохранение логики Конфликтов Расписания (CONCURRENT_EDIT)
В текущем `index.tsx` реализована критическая бизнес-логика: если при обновлении Сессии API отвечает `status === 409` и `code === 'CONCURRENT_EDIT'` или другим конфликтом, вываливается окно `Modal.confirm`.
При переводе `axios.patch` на `useMutation` (**`useSessionsControllerUpdate`**), вы **ОБЯЗАНЫ** сохранить этот бизнес-сценарий внутри хука `onError` или перехватывая Promise в `mutateAsync`. Потеря этой логики — это сломанный продакшен!

---

## План Действий (Roadmap) для Нового Агента

### Шаг 1: `index.tsx` (Глобальный стейт)
- **Целевые файлы:** `client/src/pages/ProgramEditor/index.tsx`
- **Задачи:**
  - Удалить `axios.get('/api/events/.../full-structure')` и `/api/speakers`.
  - Внедрить `useEventsControllerGetFullStructure(eventId)` и `useSpeakersControllerFindAll()`.
  - Удалить ручной `const [loading, setLoading]` и опираться на `isLoading` от React Query.
  - Найти вызовы мутаций (`axios.post`, `.patch`, `.delete`) для Сессий (Sessions) и Треков (Tracks) и перевести их на `useSessionsControllerCreate`, `useSessionsControllerUpdate`, `useTracksControllerCreate` и так далее.
  - Убедиться, что `Modal` конфликтов работает корректно при мутациях.

### Шаг 2: Модальные окна расписания (Sessions & Tracks)
- **Целевые файлы:** `SessionDrawer.tsx`, `TrackModal.tsx`
- **Задачи:**
  - В `SessionDrawer.tsx` `axios.get('/api/users/managers')` надо пробросить через автосгенерированный хук списка менеджеров.
  - Переделать логику обработки успешного сабмита (`onFinish` callbacks), убедившись, что родительская Сетка перезапрашивает данные (обычно через вызов `refetch` от React Query или инвалидацию кэша).

### Шаг 3: Второстепенные Модалки (Спикеры, Анонсы, Памятки)
- **Целевые файлы:** `SpeakerSortingModal.tsx`, `SpeakerNotificationsModal.tsx`, `AnnouncementsModal.tsx`, `SpeakerReadinessDrawer.tsx`
- **Задачи:**
  - Здесь множество вызовов `axios.get/patch` для `session-speakers`, `announcements`, `memo-template`. Заменить на вызовы контроллера `EventsController` или `SessionsController` (в зависимости от namespace в OpenAPI).

### Шаг 4: Тестирование (CDD Double Trap)
- **Целевой файл:** `e2e/tests/` (новый тест, например `cdd_program_structure.spec.ts`)
- **Задача:** Написать API-ориентированный автотест через Playwright, который авторизуется, загружает страницу Редактора Расписания и прослушивает сетевой ответ на эндпоинт `/api/events/1/full-structure`. Затем ответ прогоняется через валидатор JSON Schema:
  `apiValidator.validateResponse('/api/events/{id}/full-structure', 'get', '200', trappedResponse)`
- Тест не должен пропускать никакие нарушения типов на бэкенде.

---

## 📝 Чеклист приемки
- [ ] В папке `ProgramEditor` больше нет импорта `axios`.
- [ ] Данные (залы, треки, сессии) успешно рендерятся и переключаются по дням в UI.
- [ ] Конфликт параллельного редактирования (409) успешно открывает окошко с кнопкой "Сохранить все равно?".
- [ ] Написан и работает API E2E тест на структуру сетки.
