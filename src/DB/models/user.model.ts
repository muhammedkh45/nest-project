import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  GenderType,
  ProviderType,
  RoleType,
} from 'src/common/enums/user.enums';
import type { HOtpDocument } from './otp.model';

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
  @Virtual()
  otp: HOtpDocument;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  wishlist: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type HUserDocument = HydratedDocument<User>;
UserSchema.virtual('otp', {
  ref: 'Otp',
  localField: '_id',
  foreignField: 'createdBy',
});
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
