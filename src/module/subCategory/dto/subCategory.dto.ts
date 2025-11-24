import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { AtLeastOne } from 'src/common/decorators/brand.decorators';
import { IdsMongo } from 'src/common/decorators/category.decorators';

export class CreatedSubCategoryDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;
  @IsMongoId()
  @IsNotEmpty()
  category: Types.ObjectId;
}

@AtLeastOne(['name', 'category'])
export class UpdateSubCategoryDTO extends PartialType(CreatedSubCategoryDTO) {}

export class getSubCategoriesDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number;
  @IsOptional()
  @IsString()
  search: string;
}
