import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AtLeastOne } from 'src/common/decorators/brand.decorators';
import { COUPON_TYPE } from 'src/common/enums/coupon.enum';

export class CreatedCouponDTO {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  discount: number;

  @IsEnum(COUPON_TYPE)
  @IsOptional()
  type?: COUPON_TYPE;

  @IsOptional()
  @IsDateString()
  expiryDate?: string; 

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@AtLeastOne(['expiryDate', 'usageLimit', 'isActive', 'type'])
export class UpdateCouponDTO extends PartialType(CreatedCouponDTO) {}

export class DeleteCouponDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
