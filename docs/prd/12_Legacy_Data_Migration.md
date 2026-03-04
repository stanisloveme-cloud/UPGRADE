# PRD-12: Legacy Data Migration (Brands & Speakers)

## 1. Objective
To populate the newly implemented global "Brands Library" and update our speaker repository by migrating historical data from the legacy frontend system. Since the legacy system lacks a CSV/API export feature, this migration will utilize automated DOM scraping.

## 2. Context
- **Current State:** The new CRM system has a robust schema for global Brands and Speakers (PRD-11). However, it is currently empty.
- **Legacy State:** The historical data resides purely on the legacy frontend application.
- **Context Expansion:** The legacy system is part of a complex trio (Bitrix24 CRM -> Legacy System -> Tilda website). We currently do not know how the Bitrix24 integration works. Therefore, building a robust, reusable scraper tool integrated into our new admin panel is necessary for potential future reverse-engineering and data synchronization tasks.

## 3. Scope of Migration
1. **Brands (Sponsors/Partners):**
   - Extract brand names, logos (URLs), short descriptions, website links, and market segments if available.
   - Map extracted data to the new global `Sponsor` model.
2. **Speakers (Optional but Recommended):**
   - Extract historical speakers (Name, Company, Position, Photo URL, Bio).
   - Pre-populate the `Speaker` table to facilitate faster event assembly in the new CRM.

## 4. Technical Approach: Custom Admin Scraper Tool
We will build a dedicated Node.js scraper (e.g., using Playwright/Puppeteer) integrated directly into the CRM's admin interface.

### The Custom Script Strategy
- Write a dedicated resilient script within our backend (e.g., `backend/src/tools/scraper`).
- The script logs into the legacy system (via provided credentials), iterates through pagination, and extracts all DOM nodes.
- **CRITICAL:** The script MUST physically download all logos and avatars and save them to our local storage (or S3/object storage), generating new internal URLs. We cannot rely on external CDN links.
- Uses Prisma Client to directly insert the scraped data into our generic database.
- **Admin UI Integration:** We will expose the controls for this script in the CRM Admin Panel. This will allow administrators to trigger scrapes on demand, which is crucial because we need to reverse-engineer the data flow (the legacy system historically received data from Bitrix24, and this scraper will serve as an essential tool for future data syncs).

## 5. Execution Plan
1. **Credentials & Access:** The USER provided the credentials for the legacy frontend:
   - URL: `https://sales.upgradecrm.ru/dashboard` (specifically `https://sales.upgradecrm.ru/dashboard/program/event/16#program-container` for active event parsing)
   - Login/Email: `vladislav.shirobokov@gmail.com`
   - Password: `vladislav456`
2. **DOM Analysis:** Investigate the provided URL to determine the exact CSS selectors for brands and speakers.
3. **Scraper Development:** Agent will write the resilient Playwright-based scraper and the API endpoints to trigger it from the Admin UI.
4. **Physical File Downloading:** Implement logic to download image files (SVG, PNG, JPG), sanitize them, and store them securely on our servers, assigning new URLs in the database.
5. **Data Validation:** Output the interim JSON or present a preview in the Admin UI before committing to the DB.
6. **Database Seeding:** Execute the final Prisma transactions to populate the DB.

## 6. Success Criteria
- Global Brands library is populated with all valid historical sponsors.
- Existing Logos and Website Links are intact.
- (Optional) Speaker directory contains historical speakers.
