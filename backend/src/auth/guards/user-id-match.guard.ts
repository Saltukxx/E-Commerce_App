import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtUser } from '../strategies/jwt.strategy';

@Injectable()
export class UserIdMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user: JwtUser; params: { userId: string } }>();
    const pathUserId = parseInt(req.params.userId, 10);
    if (Number.isNaN(pathUserId) || req.user.userId !== pathUserId) {
      throw new ForbiddenException();
    }
    return true;
  }
}
