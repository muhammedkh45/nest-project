import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class SubCategory {
  @Prop({
    required: true,
    type: String,
    minlength: 3,
    maxlength: 50,
    trim: true,
    unique: true,
  })
  name: string;
  @Prop({
    type: String,
    default: function () {
      return slugify(this.name, { replacement: '-', lower: true, trim: true });
    },
  })
  slug: string;
  @Prop({ required: true, type: String })
  image: string;
  @Prop({ type: String })
  assetFolderID: string;

  @Prop({ type: { type: Types.ObjectId, ref: 'Category' } })
  category: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  deletedBy: Types.ObjectId;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
export type HSubCategoryDocument = HydratedDocument<SubCategory>;
/* document 'save' middleware: here `this` is the document and has isModified */
SubCategorySchema.pre(
  'save',
  function (this: HydratedDocument<SubCategory>, next: Function) {
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

SubCategorySchema.pre(
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
SubCategorySchema.pre(
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

SubCategorySchema.virtual('brands', {
  ref: 'Brand',
  localField: '_id',
  foreignField: 'subcategory',
});

export const SubCategoryModel = MongooseModule.forFeature([
  { name: SubCategory.name, schema: SubCategorySchema },
]);
