# PRD-11: Brands Library, Tilda Integration, and UX Refinements

## 1. Overview
This update introduces a global "Brands" library (formerly "Brand Validation"), enhancing how sponsors and partners are managed across multiple events. It also outlines the necessary API and data flags required for integrating the CRM's schedule, speakers, and sponsors into an external Tilda website. Finally, it includes UX improvements such as automatic black-and-white filters for speaker photos and a pixel-perfect "Speaker Memo" layout.

## 2. Requirements

### 2.1 Brands Library (Global Sponsors)
- **Rename Section**: "Проверка брендов" -> "Бренды".
- **Global Storage**: Brands are stored globally, independent of a single event, retaining their historical participation data.
- **Card Updates**:
  - **Add**: "Сегменты рынка" (Market Segments) - multi-select from a predefined rubricator.
  - **Add**: "Выгружать на сайт" (Export to Website) - boolean checkbox to control public visibility.
  - **Update**: Logo upload must support direct file upload (PNG/SVG, max 10MB) instead of external URLs.
  - **Remove**: CFO phone, CFO email, link to attached materials.
- **Event Linkage CJM (Customer Journey Map)**:
  - From an Event -> "Sponsors" tab: The user sees brands attached *to this specific event*.
  - User can click "Add Sponsor" -> Search and select an existing brand from the global "Brands" library, OR create a brand-new card.
  - The historical data of a brand (which events it sponsored) must be preserved.

### 2.2 Speakers & Moderators Export Logic
- **Add**: "Выгружать на сайт" (Export to Website) checkbox for Speakers and Moderators to override default behavior.
- **Default Export Logic**: 
  - Moderators/Speakers are automatically eligible for site export IF they are attached to the event AND their status is "Подтвержден" (Confirmed) or "Предварительно подтвержден" (Preliminarily Confirmed).
- **Auto-B&W Filter**: All speaker/moderator photos must be displayed in grayscale ( черно-белые ) via CSS filters (`filter: grayscale(100%)`) across the CRM and on the public site exports, without modifying the original uploaded image files.

### 2.3 Speaker Memo (Памятка спикера)
- Implement a pixel-perfect HTML/CSS layout based on the provided reference screenshot.

### 2.4 Tilda Website Integration & Layout Extraction
- **Layout Extraction**: Subagent will be used to scrape and analyze the layout from `https://spring.upgrade.st/program` and `https://spring.upgrade.st/` to generate an adaptable HTML/CSS template.
- **Integration Approach**: 
  - Since Tilda relies on visual blocks, the optimal integration method is to expose public read-only API endpoints from our CRM (e.g., `/api/public/events/:id/schedule`, `/api/public/events/:id/sponsors`).
  - Embed a custom HTML/JS block (Zero Block or T123) within Tilda that uses `fetch()` to dynamically pull and render the schedule, speakers, and brand logos on page load.
  - This ensures the website always reflects the latest CRM data without manual synchronization.

### 2.5 Legacy Data Migration
- **Subagent Scraping**: The browser subagent can be configured to log into the old system and scrape the first 20 brands to populate the global "Бренды" library. *(Alternatively, an Excel/CSV import feature already exists and could be faster if an export is available).*

## 3. Scope of Work (Tasks)
1. **Database Schema Changes**:
   - Update `Sponsor` model: drop `cfoPhone`, `cfoEmail`, `materialsLink`.
   - Add `marketSegments` (String[] or JSONB), `exportToWebsite` (Boolean), `logoFileUrl` (String).
   - Convert `Sponsor` to be a global entity with a many-to-many relationship with `Event` through a junction table (e.g., `EventSponsor`), ensuring historical event linkages are preserved.
   - Update `SessionSpeaker` model: add `exportToWebsite` (Boolean) override.
2. **Backend API Updates**:
   - Migrations and CRUD endpoints for the new global Brands architecture.
   - Public API endpoints tailored for Tilda (`/api/public/events/:id/website-data`) respecting the `exportToWebsite` and status-based visibility rules.
3. **Frontend CRM Updates**:
   - Rename sidebar item to "Бренды".
   - Refactor the Event Sponsors UI to support "Select existing" vs "Create new".
   - Update the Brand Edit Modal to reflect the new fields and file upload logic (with 10MB SVG/PNG validation).
   - Add CSS `filter: grayscale(100%)` to all speaker avatars.
   - Develop the Speaker Memo template.
4. **Data Migration & Layout Extraction (Subagent)**:
   - Run subagent tasks for Tilda layout extraction and/or legacy data migration as requested.
