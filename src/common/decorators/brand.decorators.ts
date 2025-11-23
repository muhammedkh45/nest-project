import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOne(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      propertyName: '',
      options: validationOptions,
      constraints,
      validator: {
        validate(value: string, args: ValidationArguments) {
          return constraints.some((field) => args.object[field]);
        },
        defaultMessage(args: ValidationArguments) {
          return `At least one of the required field ${constraints.join(' , ')} is missing`;
        },
      },
    });
  };
}
