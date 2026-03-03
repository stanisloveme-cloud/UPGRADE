import { IsString, IsOptional, IsArray, IsInt, IsBoolean, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsBoolean()
    @IsOptional()
    isSuperAdmin?: boolean;

    @IsBoolean()
    @IsOptional()
    canManageSpeakers?: boolean;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    eventIds?: number[];
}
