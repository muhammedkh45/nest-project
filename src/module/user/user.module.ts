import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { AuthGuard } from 'src/common/guards/authentication';

@Module({
  imports: [UserModel],
  exports: [],
  controllers: [UserController],
  providers: [UserService,UserRepository,AuthGuard],
})
export class UserModule {}
