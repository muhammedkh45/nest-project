import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HUserDocument, User } from '../models/user.model';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserRepository extends DBRepo<HUserDocument> {
  constructor(
    @InjectModel(User.name)
    protected override readonly model: Model<HUserDocument>,
  ) {
    super(model);
  }
  async createOneUser(
    data: Partial<HUserDocument>,
  ): Promise<HydratedDocument<HUserDocument>> {
    try {
      const user = this.model.create(data);
      if (!user) {
        throw new HttpException('Could not create user.', 500);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }
}
