import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { CreatedBrandDTO, getBrandsDTO, UpdateBrandDTO } from './dto/brand.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { Types } from 'mongoose';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandmodel: BrandRepository,
    private readonly subCategoryModel: SubCategoryRepository,
    private readonly productModel: ProductRepository,
    private s3service: S3Service,
  ) {}
  /**
   * Creates a brand.
   * @throws {ConflictException} If the brand name already exist.
   * @throws {InternalServerErrorException} If an error occurs while creating the brand.
   * @param {CreatedBrandDTO} brandDTO - The data to create the brand.
   * @param {HUserDocument} user - The user creating the brand.
   * @param {Express.Multer.File} file - The logo file to be uploaded.
   * @returns The created brand.
   */
  async CreateBrand(
    brandDTO: CreatedBrandDTO,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    try {
      const { name, slogan, subcategory } = brandDTO;
      const isExist = await this.brandmodel.findOne({ name });
      if (isExist) {
        throw new ConflictException('Brand name already exist.');
      } else {
        if (subcategory) {
          if (
            !(await this.subCategoryModel.find({
              filter: { _id: subcategory },
            }))
          ) {
            throw new NotFoundException('sub-category not found');
          }
        }
        const url = await this.s3service.uploadFile({ file, path: 'Brands' });
        const brand = await this.brandmodel.createOneBrand({
          name,
          slogan,
          createdBy: user._id,
          image: url,
          subcategory,
        });
        if (!brand) {
          await this.s3service.deleteFile({ Key: url });
          throw new InternalServerErrorException('Fiald to create Brand');
        }
        return brand;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Updates a brand.
   * @throws {NotFoundException} If the brand does not exist.
   * @throws {ConflictException} If the brand name or slogan already exist.
   * @param {UpdateBrandDTO} brandDTO - The data to update the brand.
   * @param {Types.ObjectId} id - The id of the brand.
   * @returns The updated brand.
   */
  async UpdateBrand(brandDTO: UpdateBrandDTO, id: Types.ObjectId) {
    try {
      const { name, slogan, subcategory } = brandDTO;
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
      if (subcategory) {
        if (!(await this.subCategoryModel.findOne({ _id: subcategory }))) {
          throw new ConflictException('Sub-Category not exist.');
        }
        brand.subcategory = subcategory;
      }

      await brand.save();
      return brand;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Updates the logo of a brand.
   * @param {Types.ObjectId} id - The id of the brand.
   * @param {Express.Multer.File} file - The logo file to be updated.
   * @throws {NotFoundException} If the brand does not exist.
   * @throws {InternalServerErrorException} If an error occurs while saving the brand.
   * @returns The updated brand.
   */
  async updateBrandLogo(id: Types.ObjectId, file: Express.Multer.File) {
    try {
      const brand = await this.brandmodel.findOne({ _id: id });
      if (!brand) {
        throw new NotFoundException('Brand not exist.');
      }
      const url = await this.s3service.uploadFile({ file, path: 'Brands' });
      const updatedBrand = await this.brandmodel.findOneAndUpdate(
        { _id: id },
        { image: url },
      );
      if (!updatedBrand) {
        await this.s3service.deleteFile({ Key: url });
        throw new InternalServerErrorException('Fiald to update brand logo');
      }
      await this.s3service.deleteFile({ Key: brand.image });
      return updatedBrand;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async freezeBrand(id: Types.ObjectId, user: HUserDocument) {
    try {
      const brand = await this.brandmodel.findOneAndUpdate(
        {
          _id: id,
          deletedAt: { $exists: false },
        },
        {
          deletedAt: new Date(),
          deletedBy: user._id,
        },
      );
      if (!brand) {
        throw new NotFoundException('Brand not exist.');
      }
      await this.productModel.updateMany(
        { brand: id },
        { deletedAt: new Date(), deletedBy: user._id },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async restoreBrand(id: Types.ObjectId) {
    try {
      const brand = await this.brandmodel.findOneAndUpdate(
        {
          _id: id,
          deletedAt: { $exists: true },
          paranoid: false,
        },
        {
          $unset: { deletedAt: '' },
          restoredAt: new Date(),
        },
      );
      if (!brand) {
        throw new NotFoundException('Brand not exist.');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async deleteBrand(id: Types.ObjectId) {
    try {
      const brand = await this.brandmodel.findOneAndDelete({
        _id: id,
        deletedAt: { $exists: true },
        paranoid: false,
      });
      if (!brand) {
        throw new NotFoundException('Brand not exist.');
      }
      await this.s3service.deleteFile({ Key: brand.image });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async getBrands(query: getBrandsDTO) {
    try {
      const { page, limit, search } = query;
      const brands = await this.brandmodel.paginate({
        filter: {
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { slogan: {}, $regex: search, $options: 'i' },
                ],
              }
            : {}),
        },
        query: { page, limit },
      });
      if (brands.length === 0) {
        throw new NotFoundException('Brand not exist.');
      }
      return brands;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
