import { HttpException, Injectable } from '@nestjs/common';
import { Order, HOrderDocument } from '../models/order.model';
import { DBRepo } from './db.repository';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
@Injectable()
export class OrderRepository extends DBRepo<HOrderDocument> {
  constructor(
    @InjectModel(Order.name)
    protected override readonly model: Model<HOrderDocument>,
  ) {
    super(model);
  }

  async createOneOrder(
    data: Partial<HOrderDocument>,
  ): Promise<HydratedDocument<HOrderDocument>> {
    try {
      const order = this.model.create(data);
      if (!order) {
        throw new HttpException('Could not create Coupon.', 500);
      }
      return order;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }
}
