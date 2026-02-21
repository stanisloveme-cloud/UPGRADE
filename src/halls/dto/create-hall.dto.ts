import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHallDto {
    @IsNotEmpty()
    @IsNumber()
    eventId: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    capacity?: number;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;
}
