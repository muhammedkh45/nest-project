import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HBrandDocument, Brand } from '../models/brand.model';

@Injectable()
export class BrandRepository extends DBRepo<HBrandDocument> {
  constructor(
    @InjectModel(Brand.name)
    protected override readonly model: Model<HBrandDocument>,
  ) {
    super(model);
  }
  async createOneBrand(
    data: Partial<HBrandDocument>,
  ): Promise<HydratedDocument<HBrandDocument>> {
    try {
      const Brand = this.model.create(data);
      if (!Brand) {
        throw new HttpException('Could not create Brand.', 500);
      }
      return Brand;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }

}
