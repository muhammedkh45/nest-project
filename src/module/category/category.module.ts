import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { UserModel } from 'src/DB/models/user.model';
import { BrandModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import ca from 'zod/v4/locales/ca.js';
import { CategoryModel } from 'src/DB/models/category.model';
import { CategoryRepository } from 'src/DB/Repositories/category.repository';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { SubCategoryModel } from 'src/DB/models/subCategory.model';
import { ProductModel } from 'src/DB/models/product.model';
import { ProductRepository } from 'src/DB/Repositories/product.repository';

@Module({
  imports: [
    UserModel,
    BrandModel,
    CategoryModel,
    SubCategoryModel,
    ProductModel,
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    CategoryRepository,
    SubCategoryRepository,
    S3Service,
    ProductRepository,
  ],
  exports: [],
})
export class CategoryModule {}
