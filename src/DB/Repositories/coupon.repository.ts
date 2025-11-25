import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HCouponDocument, Coupon } from '../models/coupon.model';

@Injectable()
export class CouponRepository extends DBRepo<HCouponDocument> {
  constructor(
    @InjectModel(Coupon.name)
    protected override readonly model: Model<HCouponDocument>,
  ) {
    super(model);
  }
  async createOneCoupon(
    data: Partial<HCouponDocument>,
  ): Promise<HydratedDocument<HCouponDocument>> {
    try {
      
      const Coupon = this.model.create(data);
      if (!Coupon) {
        throw new HttpException('Could not create Coupon.', 500);
      }
      return Coupon;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }
}
