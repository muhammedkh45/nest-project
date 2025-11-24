import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'idsMongo', async: false })
export class IdsMongo {
  validate(ids: string[], args: ValidationArguments) {
    return ids.filter((id) => Types.ObjectId.isValid(id)).length == ids.length;
  }
  defaultMessage(args: ValidationArguments) {
    return `IDs not Valid`;
  }
}
