import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from 'src/DB/Repositories/category.repository';
import {
  CreatedCategoryDTO,
  getCategoriesDTO,
  UpdateCategoryDTO,
} from './dto/category.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categorymodel: CategoryRepository,
    private readonly brandmodel: BrandRepository,
    private readonly subCategorymodel: SubCategoryRepository,
    private readonly productmodel: ProductRepository,
    private s3service: S3Service,
  ) {}
  /**
   * Creates a Category.
   * @throws {ConflictException} If the Category name already exist.
   * @throws {InternalServerErrorException} If an error occurs while creating the Category.
   * @param {CreatedCategoryDTO} CategoryDTO - The data to create the Category.
   * @param {HUserDocument} user - The user creating the Category.
   * @param {Express.Multer.File} file - The logo file to be uploaded.
   * @returns The created Category.
   */
  async CreateCategory(
    CategoryDTO: CreatedCategoryDTO,
    user: HUserDocument,
    file: Express.Multer.File,
  ) {
    try {
      const { name, slogan } = CategoryDTO;
      const isExist = await this.categorymodel.findOne({ name });
      if (isExist) {
        throw new ConflictException('Category name already exist.');
      } else {
        const assetFolderID = randomUUID();
        const url = await this.s3service.uploadFile({
          file,
          path: `Categories/${assetFolderID}`,
        });
        const Category = await this.categorymodel.createOneCategory({
          name,
          slogan,
          createdBy: user._id,
          image: url,
          assetFolderID,
        });
        if (!Category) {
          await this.s3service.deleteFile({ Key: url });
          throw new InternalServerErrorException('Fiald to create Category');
        }
        return Category;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Updates a Category.
   * @throws {NotFoundException} If the Category does not exist.
   * @throws {ConflictException} If the Category name or slogan already exist.
   * @param {UpdateCategoryDTO} CategoryDTO - The data to update the Category.
   * @param {Types.ObjectId} id - The id of the Category.
   * @returns The updated Category.
   */
  async UpdateCategory(CategoryDTO: UpdateCategoryDTO, id: Types.ObjectId) {
    try {
      const { name, slogan } = CategoryDTO;
      const Category = await this.categorymodel.findOne({ _id: id });
      if (!Category) {
        throw new NotFoundException('Category not exist.');
      }
      if (name) {
        if (await this.categorymodel.findOne({ name })) {
          throw new ConflictException('Category name already exist.');
        }
        Category.name = name;
      }

      if (slogan) {
        if (await this.categorymodel.findOne({ slogan })) {
          throw new ConflictException('Category slogan already exist.');
        }
        Category.slogan = slogan;
      }
      await Category.save();
      return Category;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Updates the logo of a Category.
   * @param {Types.ObjectId} id - The id of the Category.
   * @param {Express.Multer.File} file - The logo file to be updated.
   * @throws {NotFoundException} If the Category does not exist.
   * @throws {InternalServerErrorException} If an error occurs while saving the Category.
   * @returns The updated Category.
   */
  async updateCategoryLogo(id: Types.ObjectId, file: Express.Multer.File) {
    try {
      const Category = await this.categorymodel.findOne({ _id: id });
      if (!Category) {
        throw new NotFoundException('Category not exist.');
      }
      const url = await this.s3service.uploadFile({
        file,
        path: `Categories/${Category.assetFolderID}`,
      });
      const updatedCategory = await this.categorymodel.findOneAndUpdate(
        { _id: id },
        { image: url },
      );
      if (!updatedCategory) {
        await this.s3service.deleteFile({ Key: url });
        throw new InternalServerErrorException('Fiald to update Category logo');
      }
      await this.s3service.deleteFile({ Key: Category.image });
      return updatedCategory;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async freezeCategory(id: Types.ObjectId, user: HUserDocument) {
    try {
      const Category = await this.categorymodel.findOneAndUpdate(
        {
          _id: id,
          deletedAt: { $exists: false },
        },
        {
          deletedAt: new Date(),
          deletedBy: user._id,
        },
      );
      if (!Category) {
        throw new NotFoundException('Category not exist.');
      }

      const subCategories = await this.subCategorymodel.updateMany(
        { category: id },
        { deletedAt: new Date(), deletedBy: user._id },
      );
      await this.brandmodel.updateMany(
        { subCategory: { $in: { subCategories } } },
        { deletedAt: new Date(), deletedBy: user._id },
      );
      await this.subCategorymodel.updateMany(
        { category: id },
        { deletedAt: new Date(), deletedBy: user._id },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async restoreCategory(id: Types.ObjectId) {
    try {
      const Category = await this.categorymodel.findOneAndUpdate(
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
      if (!Category) {
        throw new NotFoundException('Category not exist.');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async deleteCategory(id: Types.ObjectId) {
    try {
      const Category = await this.categorymodel.findOneAndDelete({
        _id: id,
        deletedAt: { $exists: true },
        paranoid: false,
      });
      if (!Category) {
        throw new NotFoundException('Category not exist.');
      }
      await this.s3service.deleteFile({
        Key: Category.image,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCategories(query: getCategoriesDTO) {
    try {
      const { page, limit, search } = query;
      const Categories = await this.categorymodel.paginate({
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
        throw new NotFoundException('Category not exist.');
      }
      return Categories;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
