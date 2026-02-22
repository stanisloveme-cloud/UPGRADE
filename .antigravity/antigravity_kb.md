# Google Antigravity Knowledge Base
Current Version: 1.0
Description: Curated list of documentation, tutorials, and troubleshooting guides for Google Antigravity IDE.

## 1. Core Concepts & Official Documentation
**Context:** Fundamental understanding of the platform, API, and "Agent-First" philosophy.

* **Platform Manifesto**
    * *Concept:* "Editor" (Code), "Manager" (Orchestration), "App" (Preview).
    * *Link:* https://developers.googleblog.com/en/google-antigravity-the-agent-first-ide/
* **Documentation Hub**
    * *Concept:* Main technical reference, API, Gemini 3.0 Pro integration.
    * *Link:* https://antigravity.dev/docs/
* **Building Your First App**
    * *Concept:* The "Code -> Verify -> Iterate" loop, Artifacts usage.
    * *Link:* https://developers.googleblog.com/en/build-with-google-antigravity/

## 2. Setup & Configuration
**Context:** Initial setup, authentication, and creating rule files for the agent.

* **Setup Guide**
    * *Topic:* GCP Auth, Model connection, Environment setup.
    * *Link:* https://www.codecademy.com/article/how-to-set-up-and-use-google-antigravity
* **Rules Engineering (.antigravityrules)**
    * *Topic:* Creating `.cursorrules` / `.antigravityrules` to enforce style and safety.
    * *Link:* https://www.youtube.com/watch?v=TVRoodzA1DE
* **Agent Settings**
    * *Topic:* Autonomy levels (Plan vs Act), Memory management.
    * *Link:* https://www.youtube.com/watch?v=MmbauG5EZJ4

## 3. Advanced Skills & Context Management
**Context:** Managing large projects, external tools (MCP), and context windows.

* **Skills vs MCP**
    * *Topic:* Connecting external tools via Model Context Protocol vs Native tools.
    * *Link:* https://habr.com/ru/articles/987552/
* **Context Management**
    * *Topic:* Preventing hallucinations, feeding docs to Gemini 3.0.
    * *Link:* https://lilys.ai/notes/google-ai-studio-antigravity-context-tips

## 4. Workflow & Best Practices
**Context:** How to work efficiently, manage multiple agents, and test code.

* **Efficiency Hacks**
    * *Topic:* Writing tests, refactoring legacy code.
    * *Link:* https://www.youtube.com/watch?v=_2PM5sMkbdw
* **Manager Mode**
    * *Topic:* Orchestrating multiple agents (QA + Dev).
    * *Link:* https://antigravity.dev/docs/manager-surface
* **Verification Artifacts**
    * *Topic:* Forcing agents to generate screenshots/logs before user review.
    * *Link:* https://antigravityide.org/features/artifacts

## 5. Troubleshooting
**Context:** Solving specific errors, loops, and performance issues.

* **Rate Limits**
    * *Topic:* Handling API limits with Gemini 3 Deep Think.
    * *Link:* https://lilys.ai/notes/google-ai-studio-antigravity-rate-limit-tips
* **Troubleshooting Guide**
    * *Topic:* Common bugs, file visibility, auth errors.
    * *Link:* https://github.com/google/antigravity-issues/wiki/Troubleshooting
* **Agent Loops**
    * *Topic:* Breaking context loops and manual intervention.
    * *Link:* https://stackoverflow.com/questions/tagged/google-antigravity-loop

---

## 6. MCP Integrations (Active — 2026-02-22)
**Context:** Native MCP servers connected in this workspace. Use these for external context and VCS operations.

**Config file:** `C:\Users\PC\.gemini\antigravity\mcp_config.json`

### Context7 (`context7`)
* **Purpose:** Retrieve up-to-date library documentation and code examples.
* **Usage:** Always call before writing code using any framework (NestJS, Prisma, Ant Design, etc.)
* **Tools:** `mcp_context7_resolve-library-id` → `mcp_context7_query-docs`
* **Example:** Query NestJS Guards docs → returns 3209 code snippets, Benchmark 93.4

### GitHub (`github`)
* **Purpose:** Native GitHub API integration — repos, Actions, PRs, Issues, file contents.
* **Auth:** Personal Access Token "Antigravity IDE MCP" (scopes: repo, workflow, admin — expires Mar 19 2026)
* **Account:** `stanisloveme-cloud`
* **Main repo:** `stanisloveme-cloud/UPGRADE`
* **Tools:** `mcp_github_search_repositories`, `mcp_github_list_commits`, `mcp_github_get_file_contents`, `mcp_github_create_pull_request`, etc.
* **Prefer over:** `gh` CLI, `node scripts/check_deploy.js`, Browser Subagent for GitHub tasks.

> [!IMPORTANT]
> Fallback tools (`gh run view`, `node scripts/check_deploy.js`) remain in `./scripts/` for cases where MCP is unavailable (e.g., after IDE restart before MCP initializes).
