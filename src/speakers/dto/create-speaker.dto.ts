import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpeakerDto {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    telegram?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isSponsor?: boolean;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    internalComment?: string;

    @IsOptional()
    @IsBoolean()
    hasAssistant?: boolean;

    @IsOptional()
    @IsString()
    assistantName?: string;

    @IsOptional()
    @IsString()
    assistantContact?: string;
}
