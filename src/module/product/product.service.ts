import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import {
  CreatedProductDTO,
  getProductsDTO,
  UpdateProductDTO,
} from './dto/product.dto';
import { HUserDocument } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { Types } from 'mongoose';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { CategoryRepository } from 'src/DB/Repositories/category.repository';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly Productmodel: ProductRepository,
    private readonly subCategoryModel: SubCategoryRepository,
    private readonly CategoryModel: CategoryRepository,
    private readonly brandyModel: BrandRepository,
    private s3service: S3Service,
  ) {}
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

      if (category && subcategory && brand) {
        if (await this.brandyModel.findOne({ _id: brand, subcategory })) {
          if (
            await this.subCategoryModel.findOne({ _id: subcategory, category })
          )
            throw new NotFoundException('Brand not exist.');
        }
      }

      if (stock > quantity) {
        throw new BadRequestException(
          'Stock must be less than or equal quantity',
        );
      }

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
}
