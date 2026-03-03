import { Controller, Post, Get, Put, Delete, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // --- Super Admin Capabilities ---

    @UseGuards(SuperAdminGuard)
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(SuperAdminGuard)
    @Post()
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.createManager(dto);
    }

    @UseGuards(SuperAdminGuard)
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.usersService.updateManager(id, dto);
    }

    @UseGuards(SuperAdminGuard)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.removeManager(id);
    }

    // --- User Self-Service ---

    // SessionGuard protects this globally from app.module.ts
    @Post('change-password')
    async changePassword(@Request() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.usersService.changePassword(req.user.id, updatePasswordDto.newPassword);
    }

    @Get('managers')
    async findManagersDropdown() {
        return this.usersService.findManagersDropdown();
    }

    @Put('profile')
    async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }
}
