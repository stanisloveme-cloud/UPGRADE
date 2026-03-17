---
description: Guidelines for building React components using Ant Design Pro V5 in UPGRADE CRM.
---

# Frontend Guidelines: Ant Design Pro Architect

When scaffolding or modifying UI components for the UPGRADE CRM frontend (`client/` directory), you MUST adhere to these architectural standards.

## 1. Core Component Rules
- **DO NOT** use raw HTML `<table>`, `<form>`, or native `<input>` elements unless absolutely necessary.
- **DO NOT** build custom CSS grids or flexbox layouts for standard pages.
- **ALWAYS** use Ant Design Pro components for administration interfaces.

## 2. Structural Patterns
- **Main Layout Shell:** Use `<ProLayout>` for the app skeleton.
- **Data Lists (CRUD):** Use `<ProTable>`. It automatically handles pagination, search forms, and fetching.
- **Entity Creation/Editing (Side panels):** Use `<DrawerForm>` (specifically our wrapper `SafeDrawerForm`) for deeply nested or complex entities like Sessions or Speakers.
- **Quick Creation/Editing (Popups):** Use `<ModalForm>` (specifically our wrapper `SafeModalForm`) for smaller entities like Halls or Brands.

## 3. Dealing with Safe Forms
When working with forms, always import `SafeDrawerForm` or `SafeModalForm` instead of the raw Ant Design equivalents.
- These wrappers enforce strict data validation and surface silent errors to the user via Notifications if a hidden tab fails to validate.
- Example: `import { SafeDrawerForm } from '@/components/SafeForms/SafeDrawerForm';`
