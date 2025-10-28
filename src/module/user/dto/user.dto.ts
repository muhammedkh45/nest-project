import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorators/index';
import { GenderType, RoleType } from 'src/common/enums/user.enums';

export class AddUserDTO {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  fName: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  lName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
  @ValidateIf((data: AddUserDTO) => {
    return Boolean(data.password);
  })
  @IsMatch(['password'])
  cPassword: string;
  @IsNumber()
  @IsNotEmpty()
  @Min(18)
  age: number;
  @IsEnum(GenderType)
  gender: GenderType;
  @IsEnum(RoleType)
  role: RoleType;
}
export class LoginUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class confirmEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  otp: string;
}
export class LoginWithGoogleDTO {
  @IsString()
  token: string;
}
export class ForgetPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class ResetPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  otp: string;
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
  @ValidateIf((data: ResetPasswordDTO) => {
    return Boolean(data.password);
  })
  @IsMatch(['password'])
  cPassword: string;
}
