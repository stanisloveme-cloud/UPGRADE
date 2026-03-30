import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, IsObject } from 'class-validator';

export class CreateSponsorDto {
    @ApiProperty({ description: 'Название бренда/спонсора' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Короткое описание' })
    @IsOptional()
    @IsString()
    shortDescription?: string;

    @ApiPropertyOptional({ description: 'Ссылка на веб-сайт' })
    @IsOptional()
    @IsString()
    websiteUrl?: string;

    @ApiPropertyOptional({ description: 'Публичный email' })
    @IsOptional()
    @IsString()
    publicEmail?: string;

    @ApiPropertyOptional({ description: 'Публичный телефон' })
    @IsOptional()
    @IsString()
    publicPhone?: string;

    @ApiPropertyOptional({ description: 'Ссылка на логотип' })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({ description: 'Подробное описание' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    catalogDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    serviceCardDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    employeeCount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    annualTurnover?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    telegram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    whatsapp?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contactName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contactEmail?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cfoName?: string;

    // Как мы договорились, пока просто Any объект для гибкости (ссылочные кейсы)
    @ApiPropertyOptional({ type: Object, description: 'Кейсы (статьи или презентации)' })
    @IsOptional()
    @IsObject()
    cases?: any;

    @ApiPropertyOptional({ default: 'pending' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    rejectionReason?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    assignedManagerId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    exportToWebsite?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    logoFileUrl?: string;
}
