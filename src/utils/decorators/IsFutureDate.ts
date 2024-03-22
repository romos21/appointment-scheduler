import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions ?? {
        message: `you cannot set date earlier than ${new Date()}`,
      },
      validator: {
        validate(value: any) {
          return new Date(value) > new Date();
        },
      },
    });
  };
}
