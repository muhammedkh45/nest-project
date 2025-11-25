import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { CreatedProductDTO, UpdateProductDTO } from './dto/product.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { Types } from 'mongoose';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { CategoryRepository } from 'src/DB/Repositories/category.repository';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { UserRepository } from 'src/DB/Repositories/user.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly Productmodel: ProductRepository,
    private readonly subCategoryModel: SubCategoryRepository,
    private readonly CategoryModel: CategoryRepository,
    private readonly brandModel: BrandRepository,
    private readonly userModel: UserRepository,
    private s3service: S3Service,
  ) {}

  private async validateHierarchy(
    categoryId: Types.ObjectId,
    subcategoryId: Types.ObjectId,
    brandId: Types.ObjectId,
  ) {
    const [subExists, brandExists] = await Promise.all([
      this.subCategoryModel.exists({
        _id: subcategoryId,
        category: categoryId,
        deletedAt: null,
      }),
      this.brandModel.exists({
        _id: brandId,
        subcategory: subcategoryId,
        deletedAt: null,
      }),
    ]);

    if (!subExists) {
      throw new BadRequestException(
        'Subcategory does NOT belong to the selected category.',
      );
    }

    if (!brandExists) {
      throw new BadRequestException(
        'Brand does NOT belong to the selected subcategory.',
      );
    }

    return true;
  }

  /**
   * Creates a Product.
   * @throws {ConflictException} If the Product name already exist.
   * @throws {InternalServerErrorException} If an error occurs while creating the Product.
   * @param {CreatedProductDTO} ProductDTO - The data to create the Product.
   * @param {HUserDocument} user - The user creating the Product.
   * @param {Express.Multer.File} file - The logo file to be uploaded.
   * @returns The created Product.
   */
  async CreateProduct(
    ProductDTO: CreatedProductDTO,
    user: HUserDocument,
    files: { mainImage: Express.Multer.File; subImages: Express.Multer.File[] },
  ) {
    try {
      let {
        name,
        description,
        brand,
        category,
        discount,
        price,
        subcategory,
        quantity,
        stock,
      } = ProductDTO;

      await this.validateHierarchy(category, subcategory, brand);

      price = price - price * ((discount || 0) / 100);
      const mainImage = files.mainImage;
      const subImages = files.subImages;
      const categoryItem = await this.CategoryModel.findOne({ _id: category });
      const urlMain = await this.s3service.uploadFile({
        file: mainImage,
        path: `Categories/${categoryItem?.assetFolderID}/products/mainImage`,
      });
      const urlSubs = await this.s3service.uploadFiles({
        files: subImages,
        path: `Categories/${categoryItem?.assetFolderID}/products/subImages`,
      });
      const Product = await this.Productmodel.createOneProduct({
        name,
        description,
        price,
        discount,
        category,
        brand,
        quantity,
        stock,
        mainImage: urlMain,
        subImages: urlSubs,
        createdBy: user._id,
        subcategory,
      });
      if (!Product) {
        await this.s3service.deleteFile({ Key: urlMain });
        await this.s3service.deleteFiles({ Keys: urlSubs });
        throw new InternalServerErrorException('Fiald to create Product');
      }
      return Product;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates a Product.
   * @throws {NotFoundException} If the Product does not exist.
   * @throws {InternalServerErrorException} If an error occurs while updating the Product.
   * @param {Types.ObjectId} id - The id of the Product.
   * @param {UpdateProductDTO} ProductDTO - The data to update the Product.
   * @returns The updated Product.
   */
  async updateProduct(
    id: Types.ObjectId,
    ProductDTO: UpdateProductDTO,
    user: HUserDocument,
  ) {
    try {
      let { name, description, discount, price, quantity, stock } = ProductDTO;
      const existing = await this.Productmodel.findById(id);
      if (!existing) {
        throw new NotFoundException('Product not found.');
      }
      const category = ProductDTO.category ?? existing.category;
      const subcategory = ProductDTO.subcategory ?? existing.subcategory;
      const brand = ProductDTO.brand ?? existing.brand;
      await this.validateHierarchy(category, subcategory, brand);
      if (name) {
        existing.name = name;
      }
      if (description) {
        existing.description = description;
      }
      if (price) {
        existing.price =
          price - price * ((discount ?? existing.discount) / 100);
      } else {
        existing.price =
          (existing.price as number) -
          (existing.price as number) * ((discount ?? existing.discount) / 100);
      }
      if (quantity) {
        existing.quantity = quantity;
      }
      if (stock) {
        if (stock > existing.quantity) {
          throw new BadRequestException(
            'Stock cannot be greater than quantity',
          );
        }
        existing.stock = stock;
      }
      await existing.save();

      return await this.Productmodel.findById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async updateProductImages(
    id: Types.ObjectId,
    files: {
      mainImage: Express.Multer.File;
      subImages: Express.Multer.File[];
    },
    user: HUserDocument,
  ) {
    try {
      const existing = await this.Productmodel.findById(id);
      if (!existing) {
        throw new NotFoundException('Product not found.');
      }
      const assetFolderID = await this.CategoryModel.findById(
        existing.category,
      );
      const mainImage = files.mainImage;
      const subImages = files.subImages;
      const urlMain = await this.s3service.uploadFile({
        file: mainImage,
        path: `Categories/${assetFolderID}/products/mainImage`,
      });
      const urlSubs = await this.s3service.uploadFiles({
        files: subImages,
        path: `Categories/${assetFolderID}/products/subImages`,
      });
      const Product = await this.Productmodel.findOneAndUpdate(
        { _id: id },
        { mainImage: urlMain, subImages: urlSubs, updatedBy: user._id },
      );
      await this.s3service.deleteFile({ Key: existing.mainImage });
      await this.s3service.deleteFiles({ Keys: existing.subImages });
      return Product;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // services/wishlist.service.js

  async add_Remove_To_From_Wishlist(
    productId: Types.ObjectId,
    user: HUserDocument,
  ) {
    const product = await this.Productmodel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    let updatedUser;
    updatedUser = await this.userModel.findOneAndUpdate(
      {
        _id: user._id,
        wishlist: { $ne: productId },
      },
      {
        $addToSet: { wishlist: productId },
      },
      { new: true, populate: 'wishlist' },
    );

    if (updatedUser) {
      return {
        action: 'added',
        wishlist: updatedUser.wishlist,
      };
    }

    updatedUser = await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { $pull: { wishlist: productId } },
      { new: true, populate: 'wishlist' },
    );

    return {
      action: 'removed',
      wishlist: updatedUser.wishlist,
    };
  }
}
