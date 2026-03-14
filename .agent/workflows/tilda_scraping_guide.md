---
description: Guide for bypassing Tilda website obfuscation to scrape speaker data or media
---

# Tilda Scraping Guide (spring.upgrade.st)

When extracting data (photos, biographies, schedules) from the legacy Tilda website, automated tools (Cheerio, Playwright headless, direct DOM extraction) will often fail because Tilda aggressively minifies its internal state and hides node structures within React or LazyLoad boundaries.

## Proven Extraction Methodology

To securely extract large datasets from Tilda grids, follow this battle-tested execution pattern:

### 1. The Browser Subagent (UI Interaction)
Do not write custom scraping scripts. Instead, deploy the **Visual Browser Subagent** to physically interact with the site.
- Point the subagent to `https://spring.upgrade.st/program` or `https://spring.upgrade.st/speakers`.
- **CRITICAL INSTRUCTION**: Explicitly command the subagent to *scroll universally to the very bottom* of the page. Tilda destroys off-screen components, so the subagent must scroll to trigger network JSON hydration before executing queries.
- Ask the subagent to execute a JavaScript query directly in the browser console.

#### Example Subagent Console Script for Photos:
```javascript
var results = [];
var cells = document.querySelectorAll('.t-item, .t-col, .t-slds__item, .t104__item, .t512__item, .t339__col, .t794__col, [data-record-type="794"] .t-col, .t515__item');
cells.forEach(cell => {
    var imgEls = cell.querySelectorAll('.t-bgimg, img');
    // ... [Extract Image SRCs mapping to Yandex/Tilda CDNs] ...
    var nameEls = cell.querySelectorAll('.t-name, .t-title, [field*="title"], strong, b');
    // ... [Map Names to Arrays] ...
});
var unique = [...new Map(results.map(item => [item.photoUrl, item])).values()];
JSON.stringify(unique);
```
- Instruct the subagent to return the raw `JSON.stringify(array)` string so you can parse it externally.

### 2. Network Sync Endpoint (Database Integration)
Since local SQLite environments have different UUID auto-increments than the remote DevStand PostgreSQL containers, DO NOT try to download files locally and push them via DB migrations.
Instead, use a custom `sync` endpoint on the production Backend API.

Example (Speakers Photos): We created `@Public() async syncPhotos(@Body() payload: { name: string, photoUrl: string }[])` in `speakers.controller.ts`.

1. Inject the payload via `curl -X POST -H "Content-Type: application/json" -d @tmp/payload.json https://devupgrade.space4you.ru/api/target-route`.
2. Ensure the remote NestJS service (`speakers.service.ts`) iterates through the JSON array, fuzzy-matches the names using `prisma.[model].findFirst()`, and downloads the HTTP blob *directly* into the persistent `/app/uploads/` Docker volume.

### Summary for Future Tasks
If you are tasked with scraping *biographies*, *telephones*, or *job titles* from Tilda modals, build a new Browser Subagent script to click the modals, extract the JSON, and write a similar dynamic HTTP POST endpoint to ingest the new `.json` arrays directly on DevStand.
