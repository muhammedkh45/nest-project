import { HydratedDocument } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { HUserDocument } from 'src/DB/models/user.model';
import { TokenType } from '../enums/token.enums';

declare module 'express-serve-static-core' {
  interface Request {
    user: HUserDocument;
    decoded: JwtPayload;
    token:TokenType;
  }
}
