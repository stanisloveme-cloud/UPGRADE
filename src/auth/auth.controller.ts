
import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        // Set the express-session data
        req.session.user = req.user;
        return {
            message: 'Logged in successfully',
            user: req.user
        };
    }

    @Get('profile')
    getProfile(@Request() req: any) {
        return req.session.user; // Securely retrieve from session, not headers
    }

    @Public()
    @Post('logout')
    async logout(@Request() req: any) {
        req.session.destroy();
        return { message: 'Logged out successfully' };
    }

    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Public()
    @Post('reset-password')
    async resetPassword(@Body() body: any) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
}
