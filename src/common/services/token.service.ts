import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenType } from '../enums/token.enums';
import  { JwtPayload } from 'jsonwebtoken';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly UserRepo: UserRepository,
) {}

  generateToken = async (
    payload: object,
    options?: JwtSignOptions,
  ): Promise<string> => {
    return this.jwtService.signAsync(payload, options);
  };

  verifyToken = async ({
    token,
    options,
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return this.jwtService.verifyAsync(token, options);
  };

  getSignature = async (
    tokenType: TokenType = TokenType.access,
    prefix: string,
  ) => {
    if (tokenType === TokenType.access) {
      if (prefix.toLowerCase() === 'bearer') {
        return process.env.JWT_USER_SECRET;
      } else if (prefix.toLowerCase() === 'admin') {
        return process.env.JWT_ADMIN_SECRET;
      }
    } else if (tokenType === TokenType.refresh) {
      if (prefix.toLowerCase() === 'bearer') {
        return process.env.JWT_USER_SECRET_REFRESH;
      } else if (prefix.toLowerCase() === 'admin') {
        return process.env.JWT_ADMIN_SECRET_REFRESH;
      }
    }
    return null;
  };

  decodeTokenAndFetchUser = async (token: string, signature: string) => {
    const decoded: JwtPayload = await this.verifyToken({
      token,
      options: { secret: signature },
    });
    if (!decoded.email) {
      throw new BadRequestException('InValid Token');
    }
    const user = await this.UserRepo.findOne({ email: decoded.email });
    if (!user) {
        throw new BadRequestException('User not found');
    }
    if (!user.confirmed) {
        throw new BadRequestException('Please verify your email before login');
    }

    // if (await _revokeTokenModel.findOne({ tokenId: decoded.jti })) {
    //   throw new BadRequestException('Token has been revoked');
    // }

    // // if (user?.changeCredentials?.getTime()! > decoded?.iat! * 1000) {
    // //   throw new BadRequestException('Token has been revoked');
    // // }

    return { decoded, user };
  };
}
