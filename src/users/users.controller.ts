import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Request() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.usersService.changePassword(req.user.userId, updatePasswordDto.newPassword);
    }
}
