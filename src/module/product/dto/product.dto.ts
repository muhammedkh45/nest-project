import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { AtLeastOne } from 'src/common/decorators/brand.decorators';

export class CreatedProductDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  @IsNotEmpty()
  description: string;
  @IsMongoId()
  subcategory: Types.ObjectId;
  @IsMongoId()
  category: Types.ObjectId;
  @IsMongoId()
  brand: Types.ObjectId;
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price;
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discount;
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  quantity;
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  stock;
}

@AtLeastOne([
  'name',
  'description',
  'subcategory',
  'category',
  'brand',
  'price',
  'discount',
  'quantity',
  'stock',
])
export class UpdateProductDTO extends PartialType(CreatedProductDTO) {}

export class getProductsDTO {
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
