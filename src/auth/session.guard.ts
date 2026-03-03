import { ExecutionContext, Injectable, CanActivate, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        // Allow public access to uploads
        if (request.url.startsWith('/api/uploads/')) {
            return true;
        }

        if (request.session && request.session.user) {
            // Attach user to request for easy access in controllers, similar to what Passport did
            request.user = request.session.user;
            return true;
        }

        throw new UnauthorizedException('Session expired or not found');
    }
}
