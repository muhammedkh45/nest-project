import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HProductDocument, Product } from '../models/product.model';

@Injectable()
export class ProductRepository extends DBRepo<HProductDocument> {
  constructor(
    @InjectModel(Product.name)
    protected override readonly model: Model<HProductDocument>,
  ) {
    super(model);
  }
  async createOneProduct(
    data: Partial<HProductDocument>,
  ): Promise<HydratedDocument<HProductDocument>> {
    try {
      const Product = this.model.create(data);
      if (!Product) {
        throw new HttpException('Could not create Product.', 500);
      }
      return Product;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }
}
