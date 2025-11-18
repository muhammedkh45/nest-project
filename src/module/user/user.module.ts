import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { AuthGuard } from 'src/common/guards/authentication';
import { OtpRepository } from 'src/DB/Repositories/otp.repository';
import { OtpModel } from 'src/DB/models/otp.model';

@Module({
  imports: [UserModel,OtpModel],
  exports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, AuthGuard, OtpRepository],
})
export class UserModule {}
