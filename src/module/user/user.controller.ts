import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from 'src/common/pipes';
import { addUserSchema } from './user.validation';
import {
  AddUserDTO,
  confirmEmailDTO,
  ForgetPasswordDTO,
  LoginUserDTO,
  LoginWithGoogleDTO,
  ResetPasswordDTO,
} from './dto/user.dto';
import type { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/authentication';
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* Sign Up router*/
  @Post('/signup')
  singup(@Body() body: AddUserDTO, @Res() res: Response) {
    return this.userService.signUp(body, res);
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
  @Post('/login-with-google')
  @UseGuards(AuthGuard)
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

  /** Reset Password */
  @Post('/reset-password')
  resetPassword(@Body() body: ResetPasswordDTO, @Res() res: Response) {
    return this.userService.resetPassword(body, res);
  }
}
