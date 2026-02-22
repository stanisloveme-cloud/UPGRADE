import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
    @IsOptional()
    @IsString()
    updatedAt?: string;

    @IsOptional()
    @IsBoolean()
    force?: boolean;
}
