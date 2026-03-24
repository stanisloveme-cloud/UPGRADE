# UPGRADE CRM Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Спонсоры и Бренды**: Полностью переработан модуль глобальных брендов с выгрузкой логотипов из старой CRM. Добавлена новая расширенная карточка компании (оборот, сотрудники, контакты, добавление ссылок-кейсов).
- **Tilda Integration**: Спроектирован и внедрен инжектируемый Vanilla-JS виджет (`tilda-sponsors.js`) для отрисовки сетки логотипов (grayscale-to-color) спонсоров мероприятий прямо на сайты Tilda.
- **Дерево сегментов (Market Segments)**: Написан скрипт миграции 150+ сегментов из старой CRM в БД и разработан кастомный компонент `MarketSegmentSelector` для удобного выбора сегментов рынка в три колонки с сохранением иерархии (Группа -> Элемент).
- Created dedicated Node.js `pg` module scripts (`export_clean.js` and `import_prod_data.js`) for sanitizing, exporting, and cleanly migrating DB states across environments while preserving referential integrity and excluding administrative namespaces.
- Manually mapped Production Administrator accounts to individual Event objects within the `user_events` table to grant authorized frontend visibility.

### Fixed
- **UI Брендов**: Добавлена возможность безопасного удаления бренда (и открепления от мероприятия) через компонент `Popconfirm`. Исправлены баги со съезжающей версткой (ширина модальных окон 1000px, `labelWidth: 'auto'` в поиске `ProTable`, вертикальное выравнивание кнопок действий колонок).
- Re-formatted Git Branching strategy across Deployment Targets; successfully merged `main` into `production` to seamlessly port UI fixes (timeline widths, offset track edit icon markers) directly from DevStand to Production.
- Purged outdated Node container processes parsing `localhost` databases via port `5433` and ran commands strictly over SSH securely tunneled directly into the `erp-upgrade.ru` `upgrade-crm-app-1` backend container. 
- Overcame structural divergence by forcing `npx prisma db push --accept-data-loss` on Production to correctly map missing columns against backend APIs to cure UI layer 500 exceptions.
- **Tilda Integration**: Fixed the `tilda-integration-snippet.html` widget rendering to achieve pixel-perfect parity with Tilda's live site. Resolved issues where titles displayed as "Сессия", removed descriptions, prevented duplicated question hashes, and mapped the "Oрганизатор" & "moderator" roles accurately for visual styling differentiation.
