import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { otpTypeEnum } from 'src/common/enums/otp.enums';
import { eventEmitter } from 'src/common/utils/Events/Email.event';
import { Hash } from 'src/common/utils/Security/Hash';

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, unique: true, type: String })
  code: string;
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
  @Prop({ required: true, type: String, enum: otpTypeEnum })
  type: otpTypeEnum;
  @Prop({ required: true, type: Date, default: Date.now() + 10 * 60 * 1000 })
  expireAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(Otp);
export type HOtpDocument = HydratedDocument<Otp>;
OtpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.pre(
  'save',
  async function (
    this: HOtpDocument & { is_new: boolean; plainCode: string },
    next,
  ) {
    if (this.isModified('code')) {
      this.plainCode = this.code;
      this.is_new = this.isNew;
      this.code = await Hash(this.code, Number(process.env.SALT_ROUNDS));
      await this.populate([{ path: 'createdBy', select: 'email' }]);
    }
    next();
  },
);

OtpSchema.post('save', async function (doc, next) {
  const that = this as HOtpDocument & { is_new: boolean; plainCode: string };
  if (that.is_new) {
    eventEmitter.emit('sendEmail', {
      email: (doc.createdBy as any).email,
      OTP: that.plainCode,
      subject: doc.type,
    });
  }
  next();
});

export const OtpModel = MongooseModule.forFeature([
  { name: Otp.name, schema: OtpSchema },
]);
