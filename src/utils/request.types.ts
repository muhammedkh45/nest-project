import { HydratedDocument } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "src/DB/models/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user: HydratedDocument<HUserDocument>;
    decoded: JwtPayload;
  }
}
