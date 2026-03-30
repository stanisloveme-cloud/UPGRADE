import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpeakerEntity {
    @ApiProperty()
    id: number;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiPropertyOptional()
    company: string | null;

    @ApiPropertyOptional()
    position: string | null;

    @ApiPropertyOptional()
    email: string | null;

    @ApiPropertyOptional()
    phone: string | null;

    @ApiPropertyOptional()
    telegram: string | null;

    @ApiPropertyOptional()
    photoUrl: string | null;

    @ApiPropertyOptional()
    bio: string | null;

    @ApiProperty()
    isSponsor: boolean;

    @ApiProperty()
    exportToWebsite: boolean;

    @ApiPropertyOptional()
    internalComment: string | null;

    @ApiProperty()
    hasAssistant: boolean;

    @ApiPropertyOptional()
    assistantName: string | null;

    @ApiPropertyOptional()
    assistantContact: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
