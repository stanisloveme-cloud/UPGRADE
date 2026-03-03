import { IsString, IsNotEmpty, IsArray, IsInt, MinLength, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
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
    eventIds: number[];
}
