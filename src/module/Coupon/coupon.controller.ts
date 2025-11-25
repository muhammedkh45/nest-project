import { Body, Controller, Patch, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreatedCouponDTO, UpdateCouponDTO } from './dto/coupon.dto';
import { TokenType } from 'src/common/enums/token.enums';
import { RoleType } from 'src/common/enums/user.enums';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';
import type { HUserDocument } from 'src/DB/models/user.model';
import { Types } from 'mongoose';

@Controller('coupon')
export class CouponController {
  constructor(private readonly CouponService: CouponService) {}

  @Auth({ tokenType: TokenType.access, roles: [RoleType.admin] })
  @Post()
  async createCoupon(
    @Body() CouponDTO: CreatedCouponDTO,
    @User() user: HUserDocument,
  ) {
    return this.CouponService.createCoupon(CouponDTO);
  }
}
