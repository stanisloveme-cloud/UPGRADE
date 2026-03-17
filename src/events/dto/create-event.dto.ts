import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    eventLogoUrl?: string;

    @IsNotEmpty()
    @IsString()
    startDate: string; // ISO Date string

    @IsNotEmpty()
    @IsString()
    endDate: string;   // ISO Date string
}
