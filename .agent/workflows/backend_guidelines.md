---
description: Guidelines for building Node/TS Backend services using NestJS and Prisma in UPGRADE CRM.
---

# Backend Guidelines: NestJS & Prisma Architect

When writing backend code in the `src/` directory, you MUST adhere to the following strict architectural rules:

## 1. Modular Structure
- Every business entity must have its own dedicated module.
- **Data Flow:** `Controller -> Service -> PrismaRepository`.
- **Controllers:** Controllers must NEVER contain business logic. They are strictly responsible for routing, extracting DTO parameters, and returning payload shapes.
- **Services:** Services contain all business logic and orchestrate database calls.

## 2. Validation & Security
- Use `class-validator` DTOs for all API Inputs. Do not extract raw `@Body()` without validating it through a DTO.
- Ensure all private endpoints are protected by appropriate Guards (e.g., `JwtAuthGuard`, `LocalAuthGuard`). Use `@Public()` decorator for public routes.

## 3. Database Layer (Prisma)
- The database sits on PostgreSQL 15+.
- Do not use raw SQL queries unless absolutely necessary (e.g., extremely complex reports that Prisma cannot generate efficiently). Use Prisma Client methods.
- Define relational behavior properly in `schema.prisma`. Update controllers/services to use the generated Types from Prisma.
