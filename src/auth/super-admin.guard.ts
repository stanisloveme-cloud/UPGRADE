import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.session?.user;

        if (user && user.isSuperAdmin) {
            return true;
        }

        throw new ForbiddenException('Only SuperAdmin can perform this action');
    }
}
