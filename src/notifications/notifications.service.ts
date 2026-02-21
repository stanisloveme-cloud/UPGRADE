import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(NotificationsService.name);

    constructor() {
        this.initTestAccount();
    }

    private async initTestAccount() {
        try {
            // Generate test SMTP service account from ethereal.email
            const testAccount = await nodemailer.createTestAccount();

            this.transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            this.logger.log(`Ethereal Email initialized. Test credentials: ${testAccount.user}`);
        } catch (err) {
            this.logger.error('Failed to create Ethereal test account', err);
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
                from: '"UPGRADE CRM" <noreply@upgrade-crm.local>', // sender address
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
