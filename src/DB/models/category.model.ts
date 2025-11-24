import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictQuery: true,
})
export class Category {
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
    minlength: 3,
    maxlength: 10,
    trim: true,
  })
  slogan: string;
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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  deletedBy: Types.ObjectId;
  @Prop({ type: Date })
  deletedAt: Date;
  @Prop({ type: Date })
  restoredAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export type HCategoryDocument = HydratedDocument<Category>;
/* document 'save' middleware: here `this` is the document and has isModified */
CategorySchema.pre(
  'save',
  function (this: HydratedDocument<Category>, next: Function) {
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

CategorySchema.pre(
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
CategorySchema.pre(
  ['findOne', 'find', 'findOneAndUpdate'],
  async function (next: Function) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false) {
      this.setQuery({ ...rest, deletedAt: { $exists: true } });
    } else {
      this.setQuery({ ...rest, deletedAt: { $exists: false } });
    }
    next();
  },
);

CategorySchema.virtual('subcategories', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'category',
});

export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);
