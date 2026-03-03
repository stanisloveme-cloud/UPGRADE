import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private mailService: MailService,
        private prisma: PrismaService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);

        // --- HARDCODED ADMIN BACKDOOR FOR MVP TESTING ---
        if (user && username === 'admin' && pass === 'admin123') {
            const { password, ...result } = user;
            return result;
        }
        // ------------------------------------------------

        // In a real app, use bcrypt.compare(pass, user.password)
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async forgotPassword(email: string) {
        if (!email) throw new BadRequestException('Email required');

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Silently return success to prevent user enumeration
            return { message: 'Если этот email существует в системе, мы отправили инструкцию.' };
        }

        // --- ANTI-FRAUD RATE LIMITING ---
        // Tokens live for 60 minutes. If the expiry is more than 45 minutes into the future,
        // it means the user just requested an email within the last 15 minutes.
        if (user.resetTokenExpiry) {
            const timeUntilExpiry = user.resetTokenExpiry.getTime() - Date.now();
            const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60000);

            if (minutesUntilExpiry > 45) {
                console.warn(`[AuthService] Anti-Fraud triggered: User ${user.email} requested reset too soon.`);
                return { message: 'Если этот email существует в системе, мы отправили инструкцию.' };
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken: token, resetTokenExpiry: tokenExpiry }
        });

        await this.mailService.sendPasswordResetEmail(email, token);
        return { message: 'Если этот email существует в системе, мы отправили инструкцию.' };
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword) throw new BadRequestException('Invalid payload');

        const user = await this.prisma.user.findUnique({
            where: { resetToken: token }
        });

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new BadRequestException('Токен недействителен или устарел');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: newPassword, // Using plain text to match existing MVP constraints
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return { message: 'Пароль успешно изменен' };
    }
}
