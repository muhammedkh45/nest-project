import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { AtLeastOne } from 'src/common/decorators/brand.decorators';

export class CreatedCartDTO {
  @IsMongoId()
  @IsNotEmpty()
  productId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
}

@AtLeastOne(['productId', 'quantity'])
export class UpdateCartDTO extends PartialType(CreatedCartDTO) {}

export class DeleteCartDTO {
  @IsMongoId()
  @IsNotEmpty()
  productId: Types.ObjectId;
}
