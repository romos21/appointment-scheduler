import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsSameDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isSameDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions ?? {
        message: `${propertyName} must be equal to ${property}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const referencedDate = new Date(args.object[property]);
          const valueDate = new Date(value);
          return (
            valueDate.getDate() === referencedDate.getDate() &&
            valueDate.getMonth() === referencedDate.getMonth() &&
            valueDate.getFullYear() === referencedDate.getFullYear()
          );
        },
      },
    });
  };
}
