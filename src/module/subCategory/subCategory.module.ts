import { Module } from '@nestjs/common';
import { SubCategoryController } from './subCategory.controller';
import { SubCategoryService } from './subCategory.service';
import { TokenService } from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { S3Service } from 'src/common/services/S3Service/s3.service';
import { CategoryModel } from 'src/DB/models/category.model';
import { CategoryRepository } from 'src/DB/Repositories/category.repository';
import { SubCategoryModel } from 'src/DB/models/subCategory.model';
import { SubCategoryRepository } from 'src/DB/Repositories/subCategory.repository';

@Module({
  imports: [UserModel, CategoryModel, SubCategoryModel],
  controllers: [SubCategoryController],
  providers: [
    SubCategoryService,
    TokenService,
    JwtService,
    UserRepository,
    CategoryRepository,
    S3Service,
    SubCategoryRepository,
  ],
  exports: [],
})
export class SubCategoryModule {}
