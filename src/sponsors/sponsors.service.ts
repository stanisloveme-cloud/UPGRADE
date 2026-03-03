import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorsService {
    constructor(private prisma: PrismaService) { }

    async findAllByEvent(eventId: number) {
        return this.prisma.sponsor.findMany({
            where: { eventId },
            include: { assignedManager: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findAll(query: any) {
        const { status, managerId, search } = query;
        const where: any = {};
        if (status) where.status = status;
        if (managerId) where.assignedManagerId = Number(managerId);
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        return this.prisma.sponsor.findMany({
            where,
            include: {
                assignedManager: { select: { id: true, firstName: true, lastName: true } },
                event: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(data: any) {
        return this.prisma.sponsor.create({
            data: {
                eventId: data.eventId,
                name: data.name,
                shortDescription: data.shortDescription,
                websiteUrl: data.websiteUrl,
                publicEmail: data.publicEmail,
                publicPhone: data.publicPhone,
                logoUrl: data.logoUrl,
                description: data.description,
                catalogDescription: data.catalogDescription,
                serviceCardDescription: data.serviceCardDescription,
                marketSegments: data.marketSegments,
                city: data.city,
                employeeCount: data.employeeCount ? Number(data.employeeCount) : null,
                annualTurnover: data.annualTurnover,
                telegram: data.telegram,
                whatsapp: data.whatsapp,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                cfoName: data.cfoName,
                cfoPhone: data.cfoPhone,
                cfoEmail: data.cfoEmail,
                cases: data.cases,
                materialsUrl: data.materialsUrl,
                assignedManagerId: data.assignedManagerId ? Number(data.assignedManagerId) : null,
            }
        });
    }

    async update(id: number, data: any) {
        return this.prisma.sponsor.update({
            where: { id },
            data: {
                name: data.name,
                shortDescription: data.shortDescription,
                websiteUrl: data.websiteUrl,
                publicEmail: data.publicEmail,
                publicPhone: data.publicPhone,
                logoUrl: data.logoUrl,
                description: data.description,
                catalogDescription: data.catalogDescription,
                serviceCardDescription: data.serviceCardDescription,
                marketSegments: data.marketSegments,
                city: data.city,
                employeeCount: data.employeeCount ? Number(data.employeeCount) : null,
                annualTurnover: data.annualTurnover,
                telegram: data.telegram,
                whatsapp: data.whatsapp,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                cfoName: data.cfoName,
                cfoPhone: data.cfoPhone,
                cfoEmail: data.cfoEmail,
                cases: data.cases,
                materialsUrl: data.materialsUrl,
                status: data.status,
                assignedManagerId: data.assignedManagerId ? Number(data.assignedManagerId) : null,
            }
        });
    }

    async remove(id: number) {
        return this.prisma.sponsor.delete({ where: { id } });
    }

    async getPublicApprovalInfo(hash: string) {
        const sponsor = await this.prisma.sponsor.findUnique({
            where: { approvalHash: hash },
            include: { event: true }
        });
        if (!sponsor) throw new NotFoundException('Sponsor not found');
        return sponsor;
    }

    async submitPublicApproval(hash: string, status: string, rejectionReason: string) {
        const sponsor = await this.prisma.sponsor.findUnique({ where: { approvalHash: hash } });
        if (!sponsor) throw new NotFoundException('Sponsor not found');

        return this.prisma.sponsor.update({
            where: { id: sponsor.id },
            data: {
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : null
            }
        });
    }
}
