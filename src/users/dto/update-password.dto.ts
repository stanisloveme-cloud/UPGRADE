import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}
