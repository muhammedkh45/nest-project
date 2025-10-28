import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  GenderType,
  ProviderType,
  RoleType,
} from 'src/common/enums/user.enums';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  })
  fName: string;
  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  })
  lName: string;
  @Virtual({
    get() {
      return `${this.fName} ${this.lName}`;
    },
    set(v) {
      this.fName = v.split(' ')[0];
      this.lName = v.split(' ')[1];
    },
  })
  userName;
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;
  @Prop({ type: String, required: true, trim: true })
  password: string;
  @Prop({ type: Number, required: true, min: 18, max: 60 })
  age: number;
  @Prop({ type: String, enum: RoleType, default: RoleType.user })
  role: RoleType;
  @Prop({ type: String, enum: GenderType, default: GenderType.male })
  gender: GenderType;
  @Prop({ type: String, enum: ProviderType, default: ProviderType.local })
  provider: ProviderType;
  @Prop({ type: Date, default: Date.now() })
  changeCredentials: Date;
  @Prop({ type: Boolean })
  confirmed: boolean;
  @Prop({ type: String, minLength: 6, maxLength: 6 })
  otp: string;
  @Prop({
    type: Date,
    default: Date.now() + 10 * 60 * 1000,
  })
  otpExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
