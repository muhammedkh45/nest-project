import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { PaymentMethodEnum } from 'src/common/enums/order.enum';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
  @IsString()
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;
  @IsString()
  @IsOptional()
  coupon?: string;
}

export class ParamDTO {
  @IsMongoId()
  @IsNotEmpty()
  id: Types.ObjectId;
}
