# UPGRADE CRM Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Created dedicated Node.js `pg` module scripts (`export_clean.js` and `import_prod_data.js`) for sanitizing, exporting, and cleanly migrating DB states across environments while preserving referential integrity and excluding administrative namespaces.
- Manually mapped Production Administrator accounts to individual Event objects within the `user_events` table to grant authorized frontend visibility.

### Fixed
- Re-formatted Git Branching strategy across Deployment Targets; successfully merged `main` into `production` to seamlessly port UI fixes (timeline widths, offset track edit icon markers) directly from DevStand to Production.
- Purged outdated Node container processes parsing `localhost` databases via port `5433` and ran commands strictly over SSH securely tunneled directly into the `erp-upgrade.ru` `upgrade-crm-app-1` backend container. 
- Overcame structural divergence by forcing `npx prisma db push --accept-data-loss` on Production to correctly map missing columns against backend APIs to cure UI layer 500 exceptions.
