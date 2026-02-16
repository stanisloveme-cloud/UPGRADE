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