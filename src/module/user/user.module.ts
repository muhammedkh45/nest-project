import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { OtpRepository } from 'src/DB/Repositories/otp.repository';
import { OtpModel } from 'src/DB/models/otp.model';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';
import {
  AuthenticationMiddleware,
  TokenRequest,
} from 'src/common/middleware/authentication.middleware';
import { TokenType } from 'src/common/enums/token.enums';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { Request } from 'express';

@Module({
  imports: [UserModel, OtpModel],
  exports: [],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    AuthenticationGuard,
    OtpRepository,
    JwtService,
    TokenService,
  ],
})
export class UserModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(TokenRequest(TokenType.access), AuthenticationMiddleware)
  //     .forRoutes('users/*demo');
  // }
}
