import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.initSmtp();
    }

    private initSmtp() {
        try {
            const host = this.configService.get<string>('SMTP_HOST');
            const portStr = this.configService.get<string>('SMTP_PORT');
            const port = portStr ? parseInt(portStr, 10) : 465;
            const user = this.configService.get<string>('SMTP_USER');
            const pass = this.configService.get<string>('SMTP_PASSWORD');

            if (!host || !user || !pass) {
                this.logger.warn('SMTP configuration is missing. Emails will not be sent.');
                return;
            }

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465, // true for 465, false for other ports
                auth: {
                    user,
                    pass,
                },
            });
            this.logger.log(`SMTP initialized for host: ${host}`);
        } catch (error) {
            this.logger.error('Failed to initialize SMTP transporter', error);
        }
    }

    async sendPasswordResetEmail(to: string, token: string) {
        if (!this.transporter) {
            this.logger.error('Cannot send email: Transporter not initialized');
            return;
        }

        // We assume frontend is running on roughly the same origin, or we use a configured base URL.
        const resetLink = `http://localhost:5173/reset-password?token=${token}`; // Local UI dev link
        const productionLink = `https://devupgrade.space4u.ru/reset-password?token=${token}`;

        // CRITICAL RULE: The 'from' address MUST EXACTLY MATCH SMTP_USER for Yandex 360
        const fromUser = this.configService.get<string>('SMTP_USER');

        try {
            const info = await this.transporter.sendMail({
                from: `"UPGRADE CRM" <${fromUser}>`,
                to: to,
                subject: "Сброс пароля - UPGRADE CRM",
                text: `Здравствуйте!\nВы запросили сброс пароля. Для установки нового пароля перейдите по ссылке: ${productionLink}\n\nЛокальная (тест): ${resetLink}`,
                html: `
                    <h3>Здравствуйте!</h3>
                    <p>Вы запросили сброс пароля. Нажмите на кнопку ниже, чтобы установить новый пароль.</p>
                    <a href="${productionLink}" style="display:inline-block;padding:10px 20px;background:#1677ff;color:#fff;text-decoration:none;border-radius:4px;">Сбросить пароль</a>
                    <br/><br/>
                    <p>Или скопируйте ссылку (Локалка для теста): <a href="${resetLink}">${resetLink}</a></p>
                    <p><small>Ссылка действительна 1 час.</small></p>
                `,
            });

            this.logger.log(`Message sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error('Failed to send email', error);
        }
    }

    async sendUserInvitationEmail(to: string, token: string) {
        if (!this.transporter) {
            this.logger.error('Cannot send email: Transporter not initialized');
            return;
        }

        const resetLink = `http://localhost:5173/reset-password?token=${token}`; // Local UI dev link
        const productionLink = `https://devupgrade.space4u.ru/reset-password?token=${token}`;

        // CRITICAL RULE: The 'from' address MUST EXACTLY MATCH SMTP_USER for Yandex 360
        const fromUser = this.configService.get<string>('SMTP_USER');

        try {
            const info = await this.transporter.sendMail({
                from: `"UPGRADE CRM" <${fromUser}>`,
                to: to,
                subject: "Приглашение в UPGRADE CRM",
                text: `Здравствуйте!\nВам предоставлен доступ в платформу UPGRADE CRM в роли Менеджера.\nДля установки пароля и входа в систему перейдите по ссылке: ${productionLink}\n\nЛокальная (тест): ${resetLink}`,
                html: `
                    <h3>Здравствуйте!</h3>
                    <p>Вам предоставлен доступ в платформу UPGRADE CRM.</p>
                    <p>Для завершения регистрации и установки личного пароля нажмите на кнопку ниже.</p>
                    <a href="${productionLink}" style="display:inline-block;padding:10px 20px;background:#1677ff;color:#fff;text-decoration:none;border-radius:4px;">Установить пароль и войти</a>
                    <br/><br/>
                    <p>Или скопируйте ссылку (Локалка для теста): <a href="${resetLink}">${resetLink}</a></p>
                    <p><small>Ссылка действительна 1 час.</small></p>
                `,
            });

            this.logger.log(`Invitation Message sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error('Failed to send invitation email', error);
        }
    }
}
