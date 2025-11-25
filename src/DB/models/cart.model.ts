import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class CartProduct {
  @Prop([{ required: true, type: Types.ObjectId, ref: 'Product' }])
  productId: Types.ObjectId;
  @Prop({ required: true, type: Number })
  quantity: number;
  @Prop({ required: true, type: Number })
  finalPrice: number;
}
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Cart {
  @Prop({ type: [CartProduct] })
  products: CartProduct[];
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Number })
  subTotal: number;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  deletedBy: Types.ObjectId;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
export type HCartDocument = HydratedDocument<Cart>;
/* document 'save' middleware: here `this` is the document and has isModified */
CartSchema.pre('save', function (this: HydratedDocument<Cart>, next: Function) {
  this.subTotal = this.products.reduce(
    (total, product) => total + product.finalPrice,
    0,
  );

  next();
});

// CartSchema.pre(
//   ['findOne', 'find', 'findOneAndUpdate'],
//   async function (next: Function) {
//     const { paranoid, ...rest } = this.getQuery();
//     if (paranoid === false) {
//       this.setQuery({ ...rest, deletedAt: { $exists: true } });
//     } else {
//       this.setQuery({ ...rest, deletedAt: { $exists: false } });
//     }
//   },
// );

export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: CartSchema },
]);
