import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorsService {
    constructor(private prisma: PrismaService) { }

    async findAllByEvent(eventId: number) {
        const eventSponsors = await this.prisma.eventSponsor.findMany({
            where: { eventId: Number(eventId) },
            include: {
                sponsor: {
                    include: { assignedManager: { select: { id: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return eventSponsors.map(es => es.sponsor);
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
                events: { include: { event: { select: { id: true, name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(data: any) {
        const sponsor = await this.prisma.sponsor.create({
            data: {
                name: data.name,
                shortDescription: data.shortDescription,
                websiteUrl: data.websiteUrl,
                publicEmail: data.publicEmail,
                publicPhone: data.publicPhone,
                logoUrl: data.logoUrl,
                logoFileUrl: data.logoFileUrl,
                description: data.description,
                catalogDescription: data.catalogDescription,
                serviceCardDescription: data.serviceCardDescription,
                marketSegments: data.marketSegments,
                exportToWebsite: typeof data.exportToWebsite === 'boolean' ? data.exportToWebsite : data.exportToWebsite === 'true',
                city: data.city,
                employeeCount: data.employeeCount ? Number(data.employeeCount) : null,
                annualTurnover: data.annualTurnover,
                telegram: data.telegram,
                whatsapp: data.whatsapp,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                cfoName: data.cfoName,
                cases: data.cases,
                assignedManagerId: data.assignedManagerId ? Number(data.assignedManagerId) : null,
            }
        });

        if (data.eventId) {
            await this.prisma.eventSponsor.create({
                data: {
                    eventId: Number(data.eventId),
                    sponsorId: sponsor.id,
                }
            });
        }
        return sponsor;
    }

    async update(id: number, data: any) {
        return this.prisma.sponsor.update({
            where: { id: Number(id) },
            data: {
                name: data.name,
                shortDescription: data.shortDescription,
                websiteUrl: data.websiteUrl,
                publicEmail: data.publicEmail,
                publicPhone: data.publicPhone,
                logoUrl: data.logoUrl,
                logoFileUrl: data.logoFileUrl,
                description: data.description,
                catalogDescription: data.catalogDescription,
                serviceCardDescription: data.serviceCardDescription,
                marketSegments: data.marketSegments,
                exportToWebsite: typeof data.exportToWebsite === 'boolean' ? data.exportToWebsite : data.exportToWebsite === 'true',
                city: data.city,
                employeeCount: data.employeeCount ? Number(data.employeeCount) : null,
                annualTurnover: data.annualTurnover,
                telegram: data.telegram,
                whatsapp: data.whatsapp,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                cfoName: data.cfoName,
                cases: data.cases,
                status: data.status,
                assignedManagerId: data.assignedManagerId ? Number(data.assignedManagerId) : null,
            }
        });
    }

    async remove(id: number) {
        return this.prisma.sponsor.delete({ where: { id: Number(id) } });
    }

    async getPublicApprovalInfo(hash: string) {
        const sponsor = await this.prisma.sponsor.findUnique({
            where: { approvalHash: hash },
            include: { events: { include: { event: true } } }
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

    // New API Methods for Linking

    async attachToEvent(eventId: number, sponsorId: number) {
        const existing = await this.prisma.eventSponsor.findUnique({
            where: { eventId_sponsorId: { eventId, sponsorId } }
        });
        if (existing) return existing;

        return this.prisma.eventSponsor.create({
            data: { eventId, sponsorId }
        });
    }

    async detachFromEvent(eventId: number, sponsorId: number) {
        return this.prisma.eventSponsor.delete({
            where: { eventId_sponsorId: { eventId, sponsorId } }
        });
    }
}
