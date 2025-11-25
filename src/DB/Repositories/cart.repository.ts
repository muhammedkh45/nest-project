import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HCartDocument, Cart } from '../models/cart.model';

@Injectable()
export class CartRepository extends DBRepo<HCartDocument> {
  constructor(
    @InjectModel(Cart.name)
    protected override readonly model: Model<HCartDocument>,
  ) {
    super(model);
  }
  async createOneCart(
    data: Partial<HCartDocument>,
  ): Promise<HydratedDocument<HCartDocument>> {
    try {
      const Cart = this.model.create(data);
      if (!Cart) {
        throw new HttpException('Could not create Cart.', 500);
      }
      return Cart;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }
}
