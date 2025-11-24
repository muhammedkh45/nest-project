import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AtLeastOne } from 'src/common/decorators/brand.decorators';

export class CreatedCategoryDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(10)
  @IsNotEmpty()
  slogan: string;
}

@AtLeastOne(['name', 'slogan', 'subCategories'])
export class UpdateCategoryDTO extends PartialType(CreatedCategoryDTO) {}

export class getCategoriesDTO {
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
