import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenService } from 'src/common/services/token.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly TokenService: TokenService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType = this.reflector.get('tokenType', context.getHandler());
    let req: Request | undefined;
    let authorization: string = '';
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
      authorization = req?.headers?.authorization ?? '';
    } else {
      // Unsupported execution context for this guard
      throw new BadRequestException('Unsupported execution context');
    }
    // else if (context.getType() === 'ws') {
    // }
    // else if (context.getType() === 'rpc') {
    // }

    try {
      if (!authorization) {
        throw new BadRequestException('Authorization header missing');
      }
      const [prefix, token] = authorization.split(' ');

      if (!prefix || !token) {
        throw new BadRequestException('Token not exist.');
      }
      const signature = await this.TokenService.getSignature(
        tokenType,
        prefix,
      );
      if (!signature) {
        throw new BadRequestException('Invalid Token');
      }
      const decoded = await this.TokenService.decodeTokenAndFetchUser(
        token,
        signature,
      );
      if (!decoded) {
        throw new BadRequestException('Invalid token decoded');
      }
      req!.user = decoded.user;
      req!.decoded = decoded.decoded;
      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
