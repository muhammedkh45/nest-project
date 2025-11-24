import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HCategoryDocument, Category } from '../models/category.model';

@Injectable()
export class CategoryRepository extends DBRepo<HCategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    protected override readonly model: Model<HCategoryDocument>,
  ) {
    super(model);
  }
  async createOneCategory(
    data: Partial<HCategoryDocument>,
  ): Promise<HydratedDocument<HCategoryDocument>> {
    try {
      const Category = this.model.create(data);
      if (!Category) {
        throw new HttpException('Could not create Category.', 500);
      }
      return Category;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }

}
