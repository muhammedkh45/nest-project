import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { UserModel } from 'src/DB/models/user.model';

import { CartModel } from 'src/DB/models/cart.model';
import { CouponRepository } from 'src/DB/Repositories/coupon.repository';

@Module({
  imports: [UserModel, CartModel],
  controllers: [CouponController],
  providers: [
    TokenService,
    JwtService,
    UserRepository,
    CouponService,
    CouponRepository,
  ],
  exports: [],
})
export class CouponModule {}
