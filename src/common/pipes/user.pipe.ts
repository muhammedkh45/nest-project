import { ArgumentMetadata, HttpException, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}
  transform(value: any, metadata: ArgumentMetadata) {
    const { success, error } = this.schema.safeParse(value);
    if (!success) {
      throw new HttpException(
        {
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        error.cause as unknown as number,
      );
    }
  }
}
