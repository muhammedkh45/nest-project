import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  OrderStatusEnum,
  PaymentMethodEnum,
} from 'src/common/enums/order.enum';
import de from 'zod/v4/locales/de.js';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Order {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Cart' })
  cart: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Coupon' })
  coupon: Types.ObjectId;
  @Prop({ type: Number, required: true })
  totalPrice: number;
  @Prop({ type: String, required: true })
  address: string;
  @Prop({ type: String, required: true })
  phone: string;
  @Prop({ type: String, enum: PaymentMethodEnum, required: true })
  paymentMethod: PaymentMethodEnum;

  @Prop({ type: String, enum: OrderStatusEnum, required: true })
  status: OrderStatusEnum;
  @Prop({
    type: Date,
    required: true,
    default: Date.now() + 2 * 60 * 60 * 24 * 1000,
  })
  arrivesAt: Date;
  @Prop({ type: String })
  paymentIntent: string;
  @Prop({
    type: {
      paidAt: Date,
      canceledAt: Date,
      canceledBy: { type: Types.ObjectId, ref: 'User' },
      deliveredAt: Date,
      deliveredBy: { type: Types.ObjectId, ref: 'User' },
      refundedAt: Date,
      refundedBy: { type: Types.ObjectId, ref: 'User' },
    },
  })
  orderChanges: object;
}

export type HOrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
