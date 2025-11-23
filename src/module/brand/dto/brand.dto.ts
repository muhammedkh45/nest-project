import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AtLeastOne } from 'src/common/decorators/brand.decorators';

export class CreatedBrandDTO {
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

@AtLeastOne(['name', 'slogan'])
export class UpdateBrandDTO extends PartialType(CreatedBrandDTO) {}
