import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddUserDTO,
  confirmEmailDTO,
  ForgetPasswordDTO,
  LoginUserDTO,
  LoginWithGoogleDTO,
  OtpDTO,
  ResetPasswordDTO,
} from './dto/user.dto';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import type { Request, Response } from 'express';
import { Compare, Hash } from 'src/common/utils/Security/Hash';
import { ProviderType, RoleType } from 'src/common/enums/user.enums';
import { generateOTP } from 'src/common/utils/Security/OTPGenerator';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { OtpRepository } from 'src/DB/Repositories/otp.repository';
import { otpTypeEnum } from 'src/common/enums/otp.enums';
import { Types } from 'mongoose';
import { TokenService } from 'src/common/services/token.service';
@Injectable()
export class UserService {
  constructor(
    private readonly userModel: UserRepository,
    private readonly otpModel: OtpRepository,
    private readonly TokenService: TokenService,
  ) {}

  private async sendOtp(id: Types.ObjectId, OtpType: otpTypeEnum) {
    const OTP = await generateOTP();
    await this.otpModel.createOneOtp({
      code: OTP,
      createdBy: id,
      type: OtpType,
    });
  }

  async signUp(body: AddUserDTO, res: Response) {
    try {
      let { fName, lName, email, password, age, gender }: AddUserDTO = body;
      if (await this.userModel.findOne({ email })) {
        throw new HttpException('Email already exists.', HttpStatus.CONFLICT);
      }
      const user = await this.userModel.createOneUser({
        fName,
        lName,
        email,
        password,
        age,
        gender,
      });
      await this.sendOtp(user._id, otpTypeEnum.confirmEmail);
      return res.status(201).json({
        message: 'Created Successfuly.',
        NewUser: { Name: user.userName, email: user.email },
      });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
  async logIn(body: LoginUserDTO, res: Response) {
    try {
      let { email, password }: LoginUserDTO = body;
      const user = await this.userModel.findOne({
        email,
        // provider: ProviderType.system,
      });
      if (!user) {
        throw new HttpException('Email or Password is Invalid.', 401);
      }
      const match = await Compare(password as unknown as string, user.password);

      if (!match) {
        throw new HttpException('Email or Password is Invalid.', 401);
      }
      if (!user.confirmed) {
        throw new HttpException('Please verify your email before login', 403);
      }
      const tokenId = uuidv4();
      const accessToken = await this.TokenService.generateToken(
        { id: user._id, email: user.email },
        {
          secret:
            user?.role == RoleType.user
              ? process.env.JWT_USER_SECRET!
              : process.env.JWT_ADMIN_SECRET!,
          expiresIn: '1h',
          jwtid: tokenId,
        },
      );
      const refreshToken = await this.TokenService.generateToken(
        { id: user._id, email: user.email },
        {
          secret:
            user?.role == RoleType.user
              ? process.env.JWT_USER_SECRET_REFRESH!
              : process.env.JWT_ADMIN_SECRET_REFRESH!,
          jwtid: tokenId,
        },
      );
      return res
        .status(200)
        .json({ message: 'Logged-in Successfuly.', accessToken, refreshToken });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
  async confirmEmail(body: confirmEmailDTO, res: Response) {
    try {
      const { email, code }: confirmEmailDTO = body;
      const user = await this.userModel.findOne(
        {
          email,
          confirmed: { $exists: false },
        },
        undefined,
        {
          populate: {
            path: 'otp',
          },
        },
      );
      if (!user) {
        throw new HttpException('User not found.', 404);
      }
      if (!user.otp || !(await Compare(code!, user.otp[0].code))) {
        throw new HttpException('Invalid OTP', 400);
      }
      await this.userModel.updateOne(
        { email: user.email },
        { confirmed: true },
      );
      await this.otpModel.deleteOne({ createdBy: user._id });
      return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
  async loginWithGmail(body: LoginWithGoogleDTO, res: Response, req: Request) {
    try {
      const { token }: LoginWithGoogleDTO = body;
      const client = new OAuth2Client();
      async function verify() {
        const ticket = await client.verifyIdToken({
          idToken: token as string,
          audience: process.env.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
      }
      const { email, email_verified, picture, name } =
        (await verify()) as TokenPayload;
      let user = await this.userModel.findOne({ email });
      if (!user) {
        user = await this.userModel.create({
          userName: name,
          email,
          confirmed: email_verified,
          // image: picture,
          provider: ProviderType.google,
        });
      } else {
        throw new Error('Email already exits.', { cause: 409 });
      }
      if (user.provider !== ProviderType.google) {
        throw new Error('Please login on system ', { cause: 401 });
      }
      const tokenId = uuidv4();
      const accessToken = await this.TokenService.generateToken(
        { id: user._id, email: user.email },
        {
          secret:
            user?.role == RoleType.user
              ? process.env.JWT_USER_SECRET!
              : process.env.JWT_ADMIN_SECRET!,
          expiresIn: '1h',
          jwtid: tokenId,
        },
      );
      const refreshToken = await this.TokenService.generateToken(
        { id: user._id, email: user.email },
        {
          secret:
            user?.role == RoleType.user
              ? process.env.JWT_USER_SECRET_REFRESH!
              : process.env.JWT_ADMIN_SECRET_REFRESH!,
          jwtid: tokenId,
        },
      );
      return res
        .status(200)
        .json({ message: 'Loged in successfully', accessToken, refreshToken });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
  async forgetPassword(body: ForgetPasswordDTO, res: Response) {
    try {
      const { email }: ForgetPasswordDTO = body;
      const user = await this.userModel.findOne(
        {
          email,
          confirmed: { $exists: false },
        },
        undefined,
        {
          populate: {
            path: 'otp',
          },
        },
      );
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      await this.sendOtp(user._id, otpTypeEnum.forgetPassword);
      return res
        .status(200)
        .json({ message: 'OTP have been sent Successfully.' });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
  async resetPassword(body: ResetPasswordDTO, res: Response) {
    try {
      const { email, otp, password }: ResetPasswordDTO = body;
      const user = await this.userModel.findOne(
        {
          email,
          confirmed: { $exists: false },
        },
        undefined,
        {
          populate: {
            path: 'otp',
          },
        },
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!(await Compare(otp!, user?.otp[0].code!))) {
        throw new HttpException('Wrong OTP', 403);
      }
      const hashedPassword = await Hash(
        password as unknown as string,
        Number(process.env.SALT_ROUNDS),
      );
      await this.userModel.updateOne(
        { email: user?.email },
        { password: hashedPassword, $unset: { otp: '' } },
      );
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
  async resendOtp(body: OtpDTO, res: Response) {
    try {
      const { email }: OtpDTO = body;
      const user = await this.userModel.findOne(
        {
          email,
          confirmed: { $exists: false },
        },
        undefined,
        {
          populate: {
            path: 'otp',
          },
        },
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if ((user.otp as any).length > 0) {
        throw new BadRequestException('OTP already sent');
      }
      await this.sendOtp(user._id, otpTypeEnum.resendOtp);
      return res
        .status(200)
        .json({ message: 'OTP have been sent Successfully.' });
    } catch (error) {
      throw new HttpException(
        (error as unknown as any).message,
        (error as unknown as any).statusCode,
      );
    }
  }
}
