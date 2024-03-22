import { IsDateString, IsNotEmpty } from 'class-validator';
import { IsFutureDate } from '../../utils/decorators';

export class TimeSlotUpdateDto {
  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  currentDate: Date;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  newDate: Date;
}
