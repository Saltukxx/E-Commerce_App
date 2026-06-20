import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Allows anonymous access; attaches JWT user when Authorization header is present. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers?: { authorization?: string } }>();
    if (!request.headers?.authorization) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser | undefined {
    if (err) {
      return undefined;
    }
    return user;
  }
}
