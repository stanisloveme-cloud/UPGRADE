---
description: Workflow and systemic rules for initializing a fresh agent on the UPGRADE CRM project.
---

# UPGRADE CRM: Agent Initialization Workflow

This workflow MUST be run immediately when a new agent is attached to the UPGRADE CRM project to ensure it correctly understands the environment, tooling restrictions, and project status.

## 1. Context Acquisition (READ THESE FIRST)
The agent MUST immediately read the following files using the `view_file` tool to understand the project architecture and strict constraints:
- `d:\UPGRADE\.antigravityrules` (CRITICAL: Contains rules about MCP GitHub usage, Ant Design constraints, and architectural boundaries).
- `d:\UPGRADE\docs\INFRASTRUCTURE.md` (Details about the production DevStand server).
- `d:\UPGRADE\docs\prd\12_Legacy_Data_Migration.md` (The most recently completed business feature, giving context on the current state of the database).

## 2. Tooling & Integration Setup
1. **GitHub Constraints:** The agent must ABSOLUTELY NEVER use `git commit`, `git push`, or `git add` in the bash terminal. 
2. **MCP Verification:** The agent must verify its connection to the native `github` MCP server. All future repository modifications MUST be done via tools like `mcp_github_create_or_update_file`, `mcp_github_push_files`, etc.

## 3. Project Status (As of March 2026)
- **Frontend (`client/`):** React + Vite + Ant Design Pro. We have recently fixed critical bugs where Modals/Drawers were failing silently on "Сохранить" (Save) due to missing `onFinish` props in `SafeDrawerForm` and `SafeModalForm`.
- **Backend (`src/`):** NestJS + Prisma. Legacy Brands data migration tools have been built.
- **Testing (`e2e/`):** Playwright is fully configured for both **UI** and **API** testing against the production-like environment (`https://devupgrade.space4you.ru`).
- **Dev/Prod Flow:** Pushing to the `main` branch triggers a GitHub Action (`.github/workflows/deploy.yml`) that automatically builds and deploys to the DevStand within a few minutes.

## 4. Workflows & Skills
The agent should be aware of other user-defined workflows in `d:\UPGRADE\.agent\workflows\`:
- `/e2e_devstand_ui`: For running E2E UI and API tests.
- `/health_check`: For verifying the local deployment state.
- `/smtp_yandex_integration`: For reviewing email service configuration.

## 5. Ready State
Once the agent has read the rules and understands the context above, it should report back to the user:
> "Я инициализирован, контекст загружен, правила `.antigravityrules` прочитаны. MCP GitHub активен. Проект UPGRADE CRM (NestJS + React) готов к работе. Жду ваших инструкций!"
