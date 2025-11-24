import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HSubCategoryDocument, SubCategory } from '../models/subCategory.model';

@Injectable()
export class SubCategoryRepository extends DBRepo<HSubCategoryDocument> {
  constructor(
    @InjectModel(SubCategory.name)
    protected override readonly model: Model<HSubCategoryDocument>,
  ) {
    super(model);
  }
  async createOneSubCategory(
    data: Partial<HSubCategoryDocument>,
  ): Promise<HydratedDocument<HSubCategoryDocument>> {
    try {
      const SubCategory = this.model.create(data);
      if (!SubCategory) {
        throw new HttpException('Could not create SubCategory.', 500);
      }
      return SubCategory;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }
}
