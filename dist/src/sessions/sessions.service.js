"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionsService = class SessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { speakerIds, ...sessionData } = data;
        return this.prisma.session.create({
            data: {
                ...sessionData,
                speakers: speakerIds && speakerIds.length > 0 ? {
                    create: speakerIds.map(id => ({
                        speaker: { connect: { id } },
                        role: 'speaker',
                        status: 'confirmed'
                    }))
                } : undefined
            },
            include: { speakers: { include: { speaker: true } } }
        });
    }
    findAll() {
        return this.prisma.session.findMany({
            include: { speakers: { include: { speaker: true } } },
            orderBy: { startTime: 'asc' },
        });
    }
    async findOne(id) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                speakers: { include: { speaker: true }, orderBy: { sortOrder: 'asc' } },
                questions: { orderBy: { order: 'asc' } },
                briefings: true,
            },
        });
        if (!session)
            throw new common_1.NotFoundException(`Session #${id} not found`);
        return session;
    }
    async update(id, data) {
        const { speakerIds, ...sessionData } = data;
        if (speakerIds) {
            return this.prisma.$transaction(async (prisma) => {
                await prisma.sessionSpeaker.deleteMany({ where: { sessionId: id } });
                return prisma.session.update({
                    where: { id },
                    data: {
                        ...sessionData,
                        speakers: {
                            create: speakerIds.map(val => ({
                                speaker: { connect: { id: val } },
                                role: 'speaker',
                                status: 'confirmed'
                            }))
                        }
                    },
                    include: { speakers: { include: { speaker: true } } }
                });
            });
        }
        return this.prisma.session.update({
            where: { id },
            data: sessionData,
            include: { speakers: { include: { speaker: true } } }
        });
    }
    remove(id) {
        return this.prisma.session.delete({ where: { id } });
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map