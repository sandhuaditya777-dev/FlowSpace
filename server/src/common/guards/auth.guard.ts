import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let payload: any = null;

    if (token === 'dummy-token' || token === 'dummy_owner') {
      payload = {
        sub: 'auth0|65f123456789abcdef012345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        roles: ['owner'],
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe',
      };
    } else if (token === 'dummy_member' || token === 'dummy_jane') {
      payload = {
        sub: 'auth0|9876543210fedcba98765432',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        roles: ['member'],
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith',
      };
    } else {
      try {
        if (token.includes('.')) {
          const base64Payload = token.split('.')[1];
          if (base64Payload) {
            payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
          }
        }
      } catch (e) {
        throw new UnauthorizedException('Failed to parse authorization token');
      }
    }

    if (!payload) {
      payload = {
        sub: 'mock|' + token.substring(0, 10),
        name: 'Mock ' + token.substring(0, 5),
        email: `${token.substring(0, 5)}@example.com`,
        roles: ['member'],
      };
    }

    // Lazy-register user in database
    try {
      const user = await this.usersService.findOrCreateUser(payload.sub, {
        name: payload.name || 'Anonymous User',
        email: payload.email || `${payload.sub}@example.com`,
        avatar: payload.picture || payload.avatar,
      });
      
      // Inject Mongoose user document representation into request
      request.user = {
        sub: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: payload.roles || ['member'],
      };
    } catch (err) {
      // Fallback request injection if database fails
      request.user = payload;
    }

    return true;
  }
}

