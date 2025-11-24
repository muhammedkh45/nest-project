import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { BrandRepository } from 'src/DB/Repositories/brand.repository';
import { UserModel } from 'src/DB/models/user.model';
import { BrandModel } from 'src/DB/models/brand.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { SubCategoryModel } from 'src/DB/models/subCategory.model';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';
import { ProductRepository } from 'src/DB/Repositories/product.repository';
import { ProductModel } from 'src/DB/models/product.model';

@Module({
  imports: [UserModel, BrandModel, SubCategoryModel, ProductModel],
  controllers: [ProductController],
  providers: [
    ProductService,
    TokenService,
    JwtService,
    UserRepository,
    BrandRepository,
    ProductRepository,
    SubCategoryRepository,
    S3Service,
  ],
  exports: [],
})
export class ProductModule {}
