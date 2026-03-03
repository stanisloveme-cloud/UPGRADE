---
description: How to configure and use Yandex 360 SMTP integration for sending emails
---
# Yandex 360 SMTP Integration

This document describes the successful integration of Yandex 360 corporate email for sending UPGRADE CRM system notifications. All agents must follow these guidelines when working with email functionality.

## 1. Domain & DNS Configuration
The domain `space4u.ru` has been successfully verified in Yandex 360.
To ensure high deliverability and prevent emails from landing in spam folders, the domain's DNS contains:
- **MX Record**: Directs incoming mail to Yandex servers.
- **SPF Record (TXT)**: Authorizes Yandex to send emails on behalf of the domain (e.g., `v=spf1 redirect=_spf.yandex.net`).
- **DKIM & DMARC (TXT)**: Digital signatures configured for email authenticity.

## 2. SMTP Credentials & Environment
Emails are sent via the NestJS backend using the `nodemailer` library. 
The application relies on the following environment variables (defined in `.env`):
- `SMTP_HOST`: `smtp.yandex.ru`
- `SMTP_PORT`: `465` (Requires SSL)
- `SMTP_USER`: `no-replay@space4you.ru` 
- `SMTP_PASSWORD`: The Application Password (Пароль приложения) generated specifically for backend access in the Yandex 360 security settings.

## 3. NestJS Implementation Details
The `NotificationsService` (`src/notifications/notifications.service.ts`) is fully migrated to use these production settings via `@nestjs/config`.

**CRITICAL RULE FOR AGENTS**: 
When writing code that sends emails via `transporter.sendMail()`, the `from` address **MUST EXACTLY MATCH** the `SMTP_USER` (`no-replay@space4you.ru`). 
Yandex 360 implements strict security policies and will throw an authentication/relay error if the sender address does not match the authorized account.
✅ **Correct**: `from: '"UPGRADE CRM" <no-replay@space4you.ru>'` (or using `configService.get('SMTP_USER')`)
❌ **Incorrect**: `from: 'admin@upgrade-crm.local'`

## 4. Troubleshooting
If an agent is asked to debug email delivery issues:
1. Verify the `.env` file contains the correct App Password (not the standard mailbox password).
2. Check the NestJS backend logs for SMTP authentication errors.
3. If emails are silently going to spam, request the user to double-check their SPF and DKIM TXT records in their DNS control panel.
4. If a 5.7.1 relay access denied error occurs, ensure the `from` address matches the `SMTP_USER` exactly.
