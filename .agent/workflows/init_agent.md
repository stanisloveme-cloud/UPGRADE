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

## 3. Project Status & Change Tracking (CRITICAL)
- **Status Document:** The agent MUST read `d:\UPGRADE\docs\PROJECT_STATUS.md` to understand what features are currently deployed and what the latest changes are.
- **Change Log Duty:** UPGRADE CRM is in the **Post-MVP (Change Request)** phase. Before finishing any task or session, you MUST append a bullet point to the "Change Log (Post-MVP)" section in `docs/PROJECT_STATUS.md` detailing the architectural changes, bug fixes, or new features you successfully resolved.

## 4. Workflows & Skills
The agent should be aware of other user-defined workflows in `d:\UPGRADE\.agent\workflows\`:
- `/frontend_guidelines`: Rules for building React/Ant Design Pro components.
- `/backend_guidelines`: Rules for NestJS/Prisma architecture.
- `/e2e_devstand_ui`: For running E2E UI and API tests.
- `/health_check`: For verifying the local deployment state.
- `/smtp_yandex_integration`: For reviewing email service configuration.

## 5. Ready State
Once the agent has read the rules and understands the context above, it should report back to the user:
> "Я инициализирован, контекст загружен, правила `.antigravityrules` прочитаны. MCP GitHub активен. Проект UPGRADE CRM (NestJS + React) готов к работе. Жду ваших инструкций!"
