import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Delegate validation to Passport (validate JWT signature/expiry with Auth0)
    let passportActivated = false;
    try {
      passportActivated = (await super.canActivate(context)) as boolean;
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }

    if (!passportActivated) return false;

    const request = context.switchToHttp().getRequest();
    // Passport injected Auth0 token payload into request.user
    const payload = request.user as any;
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 2. Auto-provision user from Auth0 token claims
    const name = payload.name || payload.nickname || 'Anonymous User';
    const email = payload.email || `${payload.sub}@example.com`;
    const avatar = payload.picture || '';

    const dbUser = await this.usersService.findOrCreateUser(payload.sub, {
      name,
      email,
      avatar,
    });

    // 3. Replace request.user with fully-typed user context
    request.user = {
      sub: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar,
      roles: payload['https://cosync.com/roles'] || payload.roles || ['member'],
    };

    return true;
  }
}
