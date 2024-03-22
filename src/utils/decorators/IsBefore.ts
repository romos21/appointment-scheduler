import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isBeforeDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions ?? {
        message: `${propertyName} must go before ${property}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const referencedDate = args.object[property];
          return value < referencedDate;
        },
      },
    });
  };
}
