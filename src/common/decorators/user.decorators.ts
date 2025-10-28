import { registerDecorator, ValidationOptions, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: 'matchFields', async: false })
export class MatchFields {
  validate(value: string, args: any) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
  defaultMessage(args: any) {
    const [relatedPropertyName] = args.constraints;
    return `${relatedPropertyName} and ${args.property} must match`;
  }
}

export function IsMatch(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: MatchFields,
    });
  };
}
