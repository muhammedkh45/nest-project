import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CouponRepository } from 'src/DB/Repositories/coupon.repository';
import { CreatedCouponDTO } from './dto/coupon.dto';
import { HUserDocument } from 'src/DB/models/user.model';

@Injectable()
export class CouponService {
  constructor(private readonly Couponmodel: CouponRepository) {}

  async createCoupon(CouponDTO: CreatedCouponDTO) {
    try {
      let { code, discount, expiryDate, usageLimit, isActive, type } =
        CouponDTO;
      const isExists = await this.Couponmodel.findOne({ code });
      if (isExists) throw new ConflictException('Coupon already exists.');
      let expiry: Date;
      if (!expiryDate) {
        expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else {
        expiry = new Date(expiryDate as any);
      }

      const coupon = await this.Couponmodel.createOneCoupon({
        code,
        discount,
        expiryDate: expiry,
        usageLimit,
        isActive,
        type,
      });
      return { coupon, message: 'Coupon created successfully.' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
