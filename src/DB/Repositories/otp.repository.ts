import { HydratedDocument, Model } from 'mongoose';
import { DBRepo } from './db.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HOtpDocument, Otp } from '../models/otp.model';

@Injectable()
export class OtpRepository extends DBRepo<HOtpDocument> {
  constructor(
    @InjectModel(Otp.name)
    protected override readonly model: Model<HOtpDocument>,
  ) {
    super(model);
  }
  async createOneOtp(
    data: Partial<HOtpDocument>,
  ): Promise<HydratedDocument<HOtpDocument>> {
    try {
      const otp = this.model.create(data);
      if (!otp) {
        throw new HttpException('Could not create otp.', 500);
      }
      return otp;
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).cause,
      );
    }
  }

}
