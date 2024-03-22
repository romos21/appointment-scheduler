import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions ?? {
        message: `${propertyName} must go after ${property}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const referencedDate = args.object[property];
          return value > referencedDate;
        },
      },
    });
  };
}
