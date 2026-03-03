import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
    private transporter: nodemailer.Transporter | null = null;
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private configService: ConfigService) {
        this.initTransporter();
    }

    private initTransporter() {
        try {
            const host = this.configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email';
            const port = this.configService.get<number>('SMTP_PORT') || 587;
            const secure = port === 465;
            const user = this.configService.get<string>('SMTP_USER');
            const pass = this.configService.get<string>('SMTP_PASSWORD');

            if (user && pass) {
                this.transporter = nodemailer.createTransport({
                    host,
                    port,
                    secure,
                    auth: { user, pass },
                });
                this.logger.log(`SMTP configured for ${host}:${port} with user ${user}`);
            } else {
                this.logger.warn('SMTP credentials not fully provided. Falling back to test Ethereal mode (or ignoring). Please set SMTP_USER and SMTP_PASSWORD.');
                // Fallback to purely test / log behavior 
                this.transporter = null;
            }
        } catch (err) {
            this.logger.error('Failed to initialize SMTP transporter', err);
        }
    }

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        if (!this.transporter) {
            this.logger.warn('Email transporter not ready. Logging email content instead:');
            this.logger.debug(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"UPGRADE CRM" <${this.configService.get<string>('SMTP_USER') || 'noreply@upgrade-crm.local'}>`, // sender address matches SMTP Auth email to avoid spam blocks
                to, // list of receivers
                subject, // Subject line
                text, // plain text body
                html, // html body
            });

            this.logger.log(`Message sent: ${info.messageId}`);
            // Preview only available when sending through an Ethereal account
            this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            return info;
        } catch (error) {
            this.logger.error('Error sending email', error);
            throw error;
        }
    }
}
