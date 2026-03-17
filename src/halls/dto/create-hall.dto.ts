import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHallDto {
    @ApiProperty({ description: 'ID of the Event this hall belongs to', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    eventId: number;

    @ApiProperty({ description: 'Name of the Hall', example: 'Main Conference Room' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Maximum capacity of the hall', example: 500 })
    @IsOptional()
    @IsNumber()
    capacity?: number;

    @ApiPropertyOptional({ description: 'Sorting order for UI display', example: 10 })
    @IsOptional()
    @IsNumber()
    sortOrder?: number;
}
