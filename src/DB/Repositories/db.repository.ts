import {
  DeleteResult,
  HydratedDocument,
  Model,
  MongooseBaseQueryOptions,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  UpdateQuery,
  UpdateWriteOpResult,
  Types,
} from 'mongoose';

export class DBRepo<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}
  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }
  async findOne(
    filter: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOne(filter, select, options);
  }

  /**
   * Find a document by its id.
   */
  async findById(
    id: string | Types.ObjectId,
    select?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findById(id as any, select, options);
  }

  /**
   * Check if a document exists matching the provided filter.
   * Returns `true` if a matching document exists, otherwise `false`.
   */
  async exists(filter: RootFilterQuery<TDocument>): Promise<boolean> {
    const res = await this.model.exists(filter as any);
    return !!res;
  }
  async find({
    filter,
    select,
    options,
  }: {
    filter: RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[]> {
    return this.model.find(filter, select, options);
  }
  async paginate({
    filter,
    query,
    select,
    options,
  }: {
    filter: RootFilterQuery<TDocument>;
    query: { page?: number; limit?: number };
    select?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[]> {
    let { page = 1, limit = 5 } = query;
    if (page < 0) page = 1;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;
    const finalOptions = {
      ...options,
      skip,
      limit,
    };
    return this.model.find(filter, select, finalOptions);
  }
  async updateOne(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, update);
  }
  async updateMany(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: MongooseUpdateQueryOptions<TDocument> | null,
  ) {
    return this.model.updateMany(filter, update, options);
  }
  async findOneAndUpdate(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> = { new: true },
  ): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findOneAndUpdate(filter, update, options);
  }
  async delteOne(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async findOneAndDelete(
    filter: RootFilterQuery<TDocument>,
    options?: QueryOptions<TDocument> | null,
  ) {
    return await this.model.findOneAndDelete(filter, options);
  }
  async deleteMany(
    filter: RootFilterQuery<TDocument>,
    options?: MongooseBaseQueryOptions<TDocument> | null,
  ) {
    return await this.model.deleteMany(filter, options);
  }
  async deleteOne(
    filter: RootFilterQuery<TDocument>,
    options?: MongooseBaseQueryOptions<TDocument> | null,
  ) {
    return await this.model.deleteOne(filter, options);
  }
}
