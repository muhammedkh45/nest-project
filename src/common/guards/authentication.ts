import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  decodeTokenAndFetchUser,
  getSignature,
  TokenType,
} from 'src/utils/Security/Token';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
    tokenType: TokenType = TokenType.access,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No token provided');

    const { prefix, token } = authHeader.split(' ');
    if (!prefix || !token) {
      throw new UnauthorizedException('Invalid token');
    }
    const signature = await getSignature(tokenType, prefix);
    if (!signature) {
      throw new UnauthorizedException('Invalid Token type');
    }
    const decoded = await decodeTokenAndFetchUser(token, signature);
    if (!decoded) {
      throw new UnauthorizedException('Invalid token decoded');
    }
    request.user = decoded.user;
    request.decoded = decoded.decoded;
    return true;
  }
}

