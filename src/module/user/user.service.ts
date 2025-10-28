import {
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
  ResetPasswordDTO,
} from './dto/user.dto';
import { UserRepository } from 'src/DB/Repositories/user.repository';
import type { Request, Response } from 'express';
import { Compare, Hash } from 'src/utils/Security/Hash';
import { ProviderType, RoleType } from 'src/common/enums/user.enums';
import { generateToken } from 'src/utils/Security/Token';
import { generateOTP } from 'src/utils/Security/OTPGenerator';
import { eventEmitter } from 'src/utils/Events/Email.event';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
@Injectable()
export class UserService {
  constructor(private readonly userModel: UserRepository) {}
  async signUp(body: AddUserDTO, res: Response) {
    try {
      let { fName, lName, email, password, age, gender }: AddUserDTO = body;
      if (await this.userModel.findOne({ email })) {
        throw new HttpException('Email already exists.', HttpStatus.CONFLICT);
      }
      const OTP = await generateOTP();
      const hashedOTP = await Hash(OTP, Number(process.env.SALT_ROUNDS));
      eventEmitter.emit('sendEmail', { email, OTP, subject: 'Confirm Email' });
      password = await Hash(
        password as unknown as string,
        Number(process.env.SALT_ROUNDS),
      );
      const user = await this.userModel.createOneUser({
        fName,
        lName,
        email,
        password,
        age,
        gender,
        otp: hashedOTP,
      });
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
      const accessToken = await generateToken(
        { id: user._id, email: user.email },
        user?.role == RoleType.user
          ? process.env.JWT_USER_SECRET!
          : process.env.JWT_ADMIN_SECRET!,
        { expiresIn: '1h', jwtid: tokenId },
      );
      const refreshToken = await generateToken(
        { id: user._id, email: user.email },
        user?.role == RoleType.user
          ? process.env.JWT_USER_SECRET_REFRESH!
          : process.env.JWT_ADMIN_SECRET_REFRESH!,
        {
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
      const { email, otp }: confirmEmailDTO = body;
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new HttpException('User not found.', 404);
      }
      if (user.confirmed) {
        return res.status(200).json({ message: 'Email already verified' });
      }
      if (!user.otp || !(await Compare(otp!, user.otp))) {
        throw new HttpException('Invalid OTP', 400);
      }
      if (
        user.otpExpires &&
        user.otpExpires < (Date.now() as unknown as Date)
      ) {
        throw new HttpException('OTP expired', 400);
      }
      await this.userModel.updateOne(
        { email: user.email },
        { isVerified: true, $unset: { otp: '', otpExpires: '' } },
      );
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
      const accessToken = await generateToken(
        { id: req?.user?._id, email: req?.user?.email },
        req?.user?.role == RoleType.user
          ? process.env.JWT_USER_SECRET!
          : process.env.JWT_ADMIN_SECRET!,
        { expiresIn: '1h', jwtid: tokenId },
      );
      const refreshToken = await generateToken(
        { id: req?.user?._id, email: req?.user?.email },
        req?.user?.role == RoleType.user
          ? process.env.JWT_USER_SECRET_REFRESH!
          : process.env.JWT_ADMIN_SECRET_REFRESH!,
        {
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
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      if (!user.confirmed) {
        throw new HttpException('Email not confirmed', 403);
      }
      const OTP = await generateOTP();
      const hashedOTP = await Hash(OTP, Number(process.env.SALT_ROUNDS));
      eventEmitter.emit('forgetPassword', {
        email,
        OTP,
        subject: 'Reset Your Password',
      });
      await this.userModel.updateOne({ email }, { otp: hashedOTP });
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
      const user = await this.userModel.findOne({
        email,
        otp: { $exists: true },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!(await Compare(otp!, user?.otp!))) {
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
}
