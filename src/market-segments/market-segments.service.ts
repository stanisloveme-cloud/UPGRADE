import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketSegmentsService {
    constructor(private prisma: PrismaService) { }

    async getSegmentTree() {
        // Fetch all nodes
        const allSegments = await this.prisma.marketSegment.findMany({
            orderBy: { id: 'asc' }
        });

        // Build tree
        const segmentMap = new Map();
        const tree: any[] = [];

        // Initialize map
        allSegments.forEach(s => {
            segmentMap.set(s.id, { ...s, children: [] });
        });

        // Assign children to parents
        allSegments.forEach(s => {
            if (s.parentId) {
                const parent = segmentMap.get(s.parentId);
                if (parent) {
                    parent.children.push(segmentMap.get(s.id));
                }
            } else {
                tree.push(segmentMap.get(s.id));
            }
        });

        return tree;
    }

    findAll() {
        return this.prisma.marketSegment.findMany();
    }

    create(data: { name: string; parentId?: number }) {
        return this.prisma.marketSegment.create({ data });
    }

    async update(id: number, data: { name?: string; parentId?: number }) {
        const existing = await this.prisma.marketSegment.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Segment not found');
        return this.prisma.marketSegment.update({
            where: { id },
            data
        });
    }

    async remove(id: number) {
        const existing = await this.prisma.marketSegment.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Segment not found');
        return this.prisma.marketSegment.delete({ where: { id } });
    }

    async seed(data: any[]) {
        await this.prisma.sponsorSegment.deleteMany();
        await this.prisma.marketSegment.deleteMany();

        const createSegment = async (node: any, parentId?: number) => {
            const created = await this.prisma.marketSegment.create({
                data: {
                    name: node.name,
                    parentId: parentId || null,
                }
            });

            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    await createSegment(child, created.id);
                }
            }
        };

        for (const topLevel of data) {
            await createSegment(topLevel);
        }

        return { message: 'Seeded successfully' };
    }
}
