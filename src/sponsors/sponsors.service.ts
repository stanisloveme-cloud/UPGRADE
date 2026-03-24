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
        if (query.segments) {
            const segmentIds = query.segments.split(',').map(Number);
            where.segments = {
                some: {
                    marketSegmentId: { in: segmentIds }
                }
            };
        }

        return this.prisma.sponsor.findMany({
            where,
            include: {
                assignedManager: { select: { id: true, firstName: true, lastName: true } },
                events: { include: { event: { select: { id: true, name: true } } } },
                segments: { include: { marketSegment: { select: { id: true, name: true, parentId: true } } } }
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

        // Parse multidimensional array from Cascader: [[1, 2, 3], [1, 4]] -> unique [1, 2, 3, 4]
        if (data.segments && Array.isArray(data.segments)) {
            const uniqueSegmentIds = Array.from(new Set(data.segments.flat())).filter(id => typeof id === 'number');
            if (uniqueSegmentIds.length > 0) {
                await this.prisma.sponsorSegment.createMany({
                    data: uniqueSegmentIds.map(id => ({ sponsorId: sponsor.id, marketSegmentId: Number(id) }))
                });
            }
        }

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
        const sponsor = await this.prisma.sponsor.update({
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

        if (data.segments && Array.isArray(data.segments)) {
            const uniqueSegmentIds = Array.from(new Set(data.segments.flat())).filter(id => typeof id === 'number');
            await this.prisma.sponsorSegment.deleteMany({ where: { sponsorId: id } });
            if (uniqueSegmentIds.length > 0) {
                await this.prisma.sponsorSegment.createMany({
                    data: uniqueSegmentIds.map(sid => ({ sponsorId: id, marketSegmentId: Number(sid) }))
                });
            }
        }

        return sponsor;
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

    // Import extracted legacy brands
    async importLegacyBrands() {
        const fs = require('fs');
        const path = require('path');
        const count = { success: 0, errors: 0 };
        const dataPath = path.join(process.cwd(), 'scripts', 'scraped_brands.json');

        if (!fs.existsSync(dataPath)) {
            throw new NotFoundException('Legacy brands data file not found');
        }

        const brands = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        for (const brand of brands) {
            try {
                // Check if brand already exists by name
                const existing = await this.prisma.sponsor.findFirst({
                    where: { name: brand.name }
                });

                if (!existing) {
                    await this.prisma.sponsor.create({
                        data: {
                            name: brand.name,
                            description: brand.description || '',
                            websiteUrl: brand.websiteUrl || '',
                            logoUrl: brand.logoFileUrl || '',
                            logoFileUrl: brand.logoFileUrl || '',
                            status: 'pending', // Requires review default
                            exportToWebsite: true
                        }
                    });
                    count.success++;
                }
            } catch (err) {
                console.error(`Failed to import brand ${brand.name}:`, err.message);
                count.errors++;
            }
        }

        return { message: 'Migration Complete', ...count };
    }

    async fixBrands() {
        const fs = require('fs');
        const path = require('path');
        const sourceDir = path.join(process.cwd(), 'uploads', 'legacy_brands');
        const targetDir = path.join(process.cwd(), 'uploads', 'logos');

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        let movedCount = 0;
        if (fs.existsSync(sourceDir)) {
            const files = fs.readdirSync(sourceDir);
            for (const file of files) {
                const oldPath = path.join(sourceDir, file);
                const newPath = path.join(targetDir, file);
                fs.renameSync(oldPath, newPath);
                movedCount++;
            }
        }

        const legacyLogoBrands = await this.prisma.sponsor.findMany({
            where: {
                OR: [
                    { logoUrl: { contains: 'legacy_brands' } },
                    { logoFileUrl: { contains: 'legacy_brands' } }
                ]
            }
        });

        let fixedLogosCount = 0;
        for (const b of legacyLogoBrands) {
            const logoFn = b.logoFileUrl?.split('/').pop() || b.logoUrl?.split('/').pop();
            if (logoFn) {
                const newUrl = `/api/uploads/logos/${logoFn}`;
                await this.prisma.sponsor.update({
                    where: { id: b.id },
                    data: { logoUrl: newUrl, logoFileUrl: newUrl }
                });
                fixedLogosCount++;
            }
        }

        const revertAction = await this.prisma.sponsor.updateMany({
            where: { status: 'approved', exportToWebsite: true },
            data: { status: 'pending' }
        });

        return { 
            movedFiles: movedCount, 
            fixedLogos: fixedLogosCount, 
            revertedStatuses: revertAction.count 
        };
    }
}
