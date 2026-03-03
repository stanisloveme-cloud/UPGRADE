import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    async findOne(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
            include: { events: true }
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                canManageSpeakers: true,
                createdAt: true,
                isSuperAdmin: true,
                events: {
                    include: { event: true }
                }
            }
        });
    }

    async findManagersDropdown() {
        return this.prisma.user.findMany({
            where: { isSuperAdmin: false, isActive: true },
            select: { id: true, firstName: true, lastName: true, username: true, email: true },
            orderBy: { username: 'asc' }
        });
    }

    async createManager(dto: CreateUserDto) {
        const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existingUsername) {
            throw new ConflictException('Пользователь с таким логином уже существует');
        }

        const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingEmail) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const isInviteList = !dto.password;
        // Strong random fallback pass if not provided
        const finalPassword = dto.password || crypto.randomBytes(16).toString('hex') + 'A1!';

        // Setup initial invite token if we are inviting the user
        const token = isInviteList ? crypto.randomBytes(32).toString('hex') : null;
        const tokenExpiry = isInviteList ? new Date(Date.now() + 3600000) : null;

        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                password: finalPassword, // In real app: bcrypt.hashSync(finalPassword, 10),
                role: 'manager',
                isActive: dto.isActive !== undefined ? dto.isActive : true,
                canManageSpeakers: dto.canManageSpeakers !== undefined ? dto.canManageSpeakers : false,
                isSuperAdmin: dto.isSuperAdmin !== undefined ? dto.isSuperAdmin : false,
                resetToken: token,
                resetTokenExpiry: tokenExpiry,
                events: {
                    create: dto.eventIds.map(id => ({ eventId: id }))
                }
            }
        });

        if (isInviteList && user.email && token) {
            // Fire-and-forget the email so the API responds instantly and the frontend doesn't freeze.
            this.mailService.sendUserInvitationEmail(user.email, token).catch(e => {
                console.error("Async email dispatch failed:", e);
            });
        }

        return user;
    }

    async updateManager(id: number, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const updateData: any = {};
        if (dto.password) updateData.password = dto.password; // hash here in prod
        if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
        if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
        if (dto.email !== undefined) updateData.email = dto.email;
        if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
        if (dto.canManageSpeakers !== undefined) updateData.canManageSpeakers = dto.canManageSpeakers;
        if (dto.isSuperAdmin !== undefined) updateData.isSuperAdmin = dto.isSuperAdmin;

        // If events are provided, we overwrite them completely
        if (dto.eventIds) {
            updateData.events = {
                deleteMany: {}, // wipe existing
                create: dto.eventIds.map(eid => ({ eventId: eid })) // add new
            };
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, username: true, email: true, firstName: true, lastName: true, isActive: true, isSuperAdmin: true, canManageSpeakers: true, events: { include: { event: true } } }
        });
    }

    async updateProfile(userId: number, dto: { firstName?: string, lastName?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: { id: true, username: true, email: true, firstName: true, lastName: true, isActive: true, isSuperAdmin: true, canManageSpeakers: true, events: { include: { event: true } } }
        });
    }

    async removeManager(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.user.delete({ where: { id } });
    }

    async changePassword(userId: number, newPassword: string): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: newPassword },
        });
    }
}
