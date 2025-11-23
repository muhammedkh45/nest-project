import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { CreatedBrandDTO, UpdateBrandDTO } from './dto/brand.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandmodel: BrandRepository,
    private s3service: S3Service,
  ) {}
  async CreateBrand(
    brandDTO: CreatedBrandDTO,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    const { name, slogan } = brandDTO;
    const isExist = await this.brandmodel.findOne({ name });
    if (isExist) {
      throw new ConflictException('Brand name already exist.');
    } else {
      const url = await this.s3service.uploadFile({ file, path: 'Brands' });
      const brand = await this.brandmodel.createOneBrand({
        name,
        slogan,
        createdBy: user._id,
        image: url,
      });
      if (!brand) {
        await this.s3service.deleteFile({ Key: url });
        throw new InternalServerErrorException('Fiald to create Brand');
      }
      return brand;
    }
  }
  async UpdateBrand(
    brandDTO: UpdateBrandDTO,
    user: HUserDocument,
    id: Types.ObjectId,
  ) {
    const { name, slogan } = brandDTO;
    const brand = await this.brandmodel.findOne({ _id: id });
    if (!brand) {
      throw new NotFoundException('Brand not exist.');
    }
    if (name) {
      if (await this.brandmodel.findOne({ name })) {
        throw new ConflictException('Brand name already exist.');
      }
      brand.name = name;
    }

    if (slogan) {
      if (await this.brandmodel.findOne({ slogan })) {
        throw new ConflictException('Brand slogan already exist.');
      }
      brand.slogan = slogan;
    }
    await brand.save();
    return brand;
  }
}
