import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from 'src/common/enums/user.enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req = context.switchToHttp().getRequest();
    let accessRole: RoleType[] = this.reflector.get(
      'accessRole',
      context.getHandler(),
    );
    try {
      if (!accessRole.includes(req.user.role))
        throw new UnauthorizedException();
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
