import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatedSubCategoryDTO,
  getSubCategoriesDTO,
  UpdateSubCategoryDTO,
} from './dto/subCategory.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { CategoryRepository } from 'src/DB/Repositories/category.repository';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Injectable()
export class SubCategoryService {
  constructor(
    private readonly subCategorymodel: SubCategoryRepository,
    private readonly Categorymodel: CategoryRepository,
    private readonly brandmodel: BrandRepository,
    private readonly productmodel: ProductRepository,
    private s3service: S3Service,
  ) {}
  /**
   * Creates a SubSubCategory.
   * @throws {ConflictException} If the SubCategory name already exist.
   * @throws {InternalServerErrorException} If an error occurs while creating the SubCategory.
   * @param {CreatedSubCategoryDTO} SubCategoryDTO - The data to create the SubCategory.
   * @param {HUserDocument} user - The user creating the SubCategory.
   * @param {Express.Multer.File} file - The logo file to be uploaded.
   * @returns The created SubCategory.
   */
  async CreateSubCategory(
    SubCategoryDTO: CreatedSubCategoryDTO,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    try {
      const { name, category } = SubCategoryDTO;
      const isExist = await this.subCategorymodel.findOne({ name });
      if (isExist) {
        throw new ConflictException('SubCategory name already exist.');
      }
      if (category) {
        if (!(await this.Categorymodel.findOne({ _id: category })))
          throw new NotFoundException('Category not found');
      } else {
        throw new NotFoundException(
          'you must add the sub-category to an existing category ',
        );
      }

      const assetFolderID = randomUUID();
      const url = await this.s3service.uploadFile({
        file,
        path: `Categories/${name}/${assetFolderID}`,
      });
      const SubCategory = await this.subCategorymodel.createOneSubCategory({
        name,
        createdBy: user._id,
        image: url,
        assetFolderID,
      });
      if (!SubCategory) {
        await this.s3service.deleteFile({ Key: url });
        throw new InternalServerErrorException('Fiald to create SubCategory');
      }
      return SubCategory;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Updates a SubCategory.
   * @throws {NotFoundException} If the SubCategory does not exist.
   * @throws {ConflictException} If the SubCategory name or slogan already exist.
   * @param {UpdateSubCategoryDTO} SubCategoryDTO - The data to update the SubCategory.
   * @param {Types.ObjectId} id - The id of the SubCategory.
   * @returns The updated SubCategory.
   */
  async UpdateSubCategory(
    SubCategoryDTO: UpdateSubCategoryDTO,
    id: Types.ObjectId,
  ) {
    try {
      const { name, category } = SubCategoryDTO;
      const SubCategory = await this.subCategorymodel.findOne({ _id: id });
      if (!SubCategory) {
        throw new NotFoundException('SubCategory not exist.');
      }
      if (name) {
        if (await this.subCategorymodel.findOne({ name })) {
          throw new ConflictException('SubCategory name already exist.');
        }
        SubCategory.name = name;
      }
      if (category) {
        if (await this.Categorymodel.find({ filter: { _id: category } })) {
          throw new NotFoundException('category not found');
        }
        SubCategory.category = category;
      }
      await SubCategory.save();
      return SubCategory;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Updates the logo of a SubCategory.
   * @param {Types.ObjectId} id - The id of the SubCategory.
   * @param {Express.Multer.File} file - The logo file to be updated.
   * @throws {NotFoundException} If the SubCategory does not exist.
   * @throws {InternalServerErrorException} If an error occurs while saving the SubCategory.
   * @returns The updated SubCategory.
   */
  async updateSubCategoryLogo(id: Types.ObjectId, file: Express.Multer.File) {
    try {
      const SubCategory = await this.subCategorymodel.findOne({ _id: id });
      if (!SubCategory) {
        throw new NotFoundException('SubCategory not exist.');
      }
      const url = await this.s3service.uploadFile({
        file,
        path: `Categories/${SubCategory.name}/${SubCategory.assetFolderID}`,
      });
      const updatedSubCategory = await this.subCategorymodel.findOneAndUpdate(
        { _id: id },
        { image: url },
      );
      if (!updatedSubCategory) {
        await this.s3service.deleteFile({ Key: url });
        throw new InternalServerErrorException(
          'Fiald to update SubCategory logo',
        );
      }
      await this.s3service.deleteFile({ Key: SubCategory.image });
      return updatedSubCategory;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async freezeSubCategory(id: Types.ObjectId, user: HUserDocument) {
    try {
      const SubCategory = await this.subCategorymodel.findOneAndUpdate(
        {
          _id: id,
          deletedAt: { $exists: false },
        },
        {
          deletedAt: new Date(),
          deletedBy: user._id,
        },
      );
      if (!SubCategory) {
        throw new NotFoundException('SubCategory not exist.');
      }
      await this.brandmodel.updateMany(
        { subcategory: id },
        { deletedAt: new Date(), deletedBy: user._id },
      );
      await this.productmodel.updateMany(
        { subcategory: id },
        { deletedAt: new Date(), deletedBy: user._id },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async restoreSubCategory(id: Types.ObjectId) {
    try {
      const SubCategory = await this.subCategorymodel.findOneAndUpdate(
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
      if (!SubCategory) {
        throw new NotFoundException('SubCategory not exist.');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async deleteSubCategory(id: Types.ObjectId) {
    try {
      const SubCategory = await this.subCategorymodel.findOneAndDelete({
        _id: id,
        deletedAt: { $exists: true },
        paranoid: false,
      });
      if (!SubCategory) {
        throw new NotFoundException('SubCategory not exist.');
      }
      await this.s3service.deleteFile({
        Key: SubCategory.image,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async getSubCategories(query: getSubCategoriesDTO) {
    try {
      const { page, limit, search } = query;
      const Categories = await this.subCategorymodel.paginate({
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
      if (Categories.length === 0) {
        throw new NotFoundException('SubCategory not exist.');
      }
      return Categories;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
