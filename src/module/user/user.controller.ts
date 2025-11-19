import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  SetMetadata,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  AddUserDTO,
  confirmEmailDTO,
  ForgetPasswordDTO,
  LoginUserDTO,
  LoginWithGoogleDTO,
  OtpDTO,
  ResetPasswordDTO,
} from './dto/user.dto';
import type { Request, Response } from 'express';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { Otp } from 'src/DB/models/otp.model';
import { set } from 'mongoose';
import { TokenType } from 'src/common/enums/token.enums';
import { RoleType } from 'src/common/enums/user.enums';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* Sign Up router*/
  @Post('/signup')
  singup(@Body() body: AddUserDTO, @Res() res: Response) {
    return this.userService.signUp(body, res);
  }
  @Post('/resendOtp')
  resendOtp(@Body() body: OtpDTO, @Res() res: Response) {
    return this.userService.resendOtp(body, res);
  }

  /*Login Router */
  @Post('/login')
  login(@Body() body: LoginUserDTO, @Res() res: Response) {
    return this.userService.logIn(body, res);
  }

  /*Confirm Email Router */
  @Post('/confirmEmail')
  confirmEmail(@Body() body: confirmEmailDTO, @Res() res: Response) {
    return this.userService.confirmEmail(body, res);
  }

  /*login with Gmail Router */
  @SetMetadata('tokenType', TokenType.access)
  @UseGuards(AuthenticationGuard)
  @Post('/login-with-google')
  loginWithGmail(
    @Body() body: LoginWithGoogleDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.userService.loginWithGmail(body, res, req);
  }

  /* Forget Password */
  @Post('/forget-password')
  forgetPassword(@Body() body: ForgetPasswordDTO, @Res() res: Response) {
    return this.userService.forgetPassword(body, res);
  }
  @SetMetadata('accessRole', [
    RoleType.admin,
    RoleType.superAdmin,
    RoleType.user,
  ])
  @UseGuards(AuthorizationGuard)
  /** Reset Password */
  @Post('/reset-password')
  resetPassword(@Body() body: ResetPasswordDTO, @Res() res: Response) {
    return this.userService.resetPassword(body, res);
  }
}
