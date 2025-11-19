import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { TokenService } from '../services/token.service';
import { TokenType } from '../enums/token.enums';

export const TokenRequest = (TokenType: TokenType) => {
  return (res: Response, req: Request, next: NextFunction) => {
    req.token = TokenType;
    next();
  };
};

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly TokenService: TokenService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        throw new BadRequestException('Authorization header missing');
      }
      const [prefix, token] = authorization.split(' ');

      if (!prefix || !token) {
        throw new BadRequestException('Token not exist.');
      }
      const signature = await this.TokenService.getSignature(req.token, prefix);
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
      req.user = decoded.user;
      req.decoded = decoded.decoded;
      return next();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
