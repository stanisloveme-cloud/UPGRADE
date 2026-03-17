---
description: Contract-Driven Development API Update Workflow
---
# Contract-Driven Development API Update Workflow

This workflow MUST be followed whenever you are asked to add or modify a field in the backend controller that affects the frontend, OR when you need to update the API contract between backend and frontend.

## Prerequisites
- You must be working on the `dev-2` branch (or the designated CDD testing branch).
- The NestJS backend must be configured with `@nestjs/swagger` to produce `openapi.json`.
- The frontend must be heavily reliant on generated types (e.g., using `orval` outputting to `client/src/api/generated/`).

## Steps

1. **Modify Backend DTOs & Controllers:**
   - Add or change the necessary fields in the NestJS DTOs (`*.dto.ts`).
   - Ensure the fields are decorated with appropriate `@ApiProperty()` tags and class-validator decorators.
   - Update the Controller and Service logic as requested by the user.

2. **Generate/Update Backend Swagger Contract:**
   - Run the command to generate or update the `openapi.json` contract from the backend.
   - (Usually, this involves running the backend dev server briefly, or running a specific NPM script like `npm run openapi:generate` in the root/backend if configured).

3. **Generate Frontend API Client & Types:**
   - Navigate to the frontend directory (`cd client`).
   - Run the frontend API generation script (`npm run api:generate`).
   - Verify that the generated types and API hooks in `client/src/api/generated/` have been updated with your new fields.

4. **Implement Frontend UI Changes:**
   - ONLY AFTER the generated types are updated, import the new types/hooks into your React components.
   - Update the UI (e.g., `ProForm`, `ProTable`) to display or edit the newly added fields using the strictly typed generated API client.
   - DO NOT manually create Axios requests or write manual TypeScript interfaces for API responses.

5. **Verify End-to-End:**
   - Test the flow from the UI to the backend and check the database.
