import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { UserModel } from 'src/DB/models/user.model';
import { BrandModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';

@Module({
  imports: [UserModel, BrandModel],
  controllers: [BrandController],
  providers: [
    BrandService,
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    S3Service,
  ],
  exports: [],
})
export class BrandModule {}
