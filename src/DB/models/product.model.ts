import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Product {
  @Prop({
    required: true,
    type: String,
    minlength: 3,
    maxlength: 250,
    trim: true,
  })
  name: string;
  @Prop({
    type: String,
    minlength: 10,
    maxlength: 10000,
    trim: true,
  })
  description: string;
  @Prop({
    type: String,
    default: function () {
      return slugify(this.name, { replacement: '-', lower: true, trim: true });
    },
  })
  slug: string;
  @Prop({ required: true, type: String })
  mainImage: string;
  @Prop([{ required: true, type: String }])
  subImages: string[];
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ required: true, type: Number })
  price: number;
  @Prop({ type: Number, min: 0, max: 100 })
  discount: number;

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'SubCategory' })
  subcategory: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ type: Number, min: 0 })
  quantity: number;
  @Prop({ type: Number, min: 0 })
  stock: number;

  @Prop({ type: Number })
  rateNum: number;
  @Prop({ type: Number })
  rateAvg: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  deletedBy: Types.ObjectId;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type HProductDocument = HydratedDocument<Product>;
/* document 'save' middleware: here `this` is the document and has isModified */
ProductSchema.pre(
  'save',
  function (this: HydratedDocument<Product>, next: Function) {
    if (this.isModified('name')) {
      this.slug = slugify(this.name, {
        replacement: '-',
        lower: true,
        trim: true,
      });
    }
    next();
  },
);

ProductSchema.pre(
  ['findOneAndUpdate', 'updateOne'],
  function (this: any, next: Function) {
    const update = this.getUpdate && this.getUpdate();
    if (!update) return next();
    const name = update.name ?? update.$set?.name;
    if (!name) return next();
    const slug = slugify(name, {
      replacement: '-',
      lower: true,
      trim: true,
    });
    if (update.$set) {
      update.$set.slug = slug;
    } else {
      update.slug = slug;
    }
    this.setUpdate(update);
    next();
  },
);
ProductSchema.pre(
  ['findOne', 'find', 'findOneAndUpdate'],
  async function (next: Function) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false) {
      this.setQuery({ ...rest, deletedAt: { $exists: true } });
    } else {
      this.setQuery({ ...rest, deletedAt: { $exists: false } });
    }
  },
);

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
