import { Schema, Prop, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { COUPON_TYPE } from 'src/common/enums/coupon.enum';

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  discount: number;

  @Prop({ enum: COUPON_TYPE, default: COUPON_TYPE.PERCENTAGE })
  type: string;

  @Prop({ default: null })
  expiryDate: Date;

  @Prop({ default: 0 })
  usageLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });
export type HCouponDocument = HydratedDocument<Coupon>;

export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: CouponSchema },
]);
