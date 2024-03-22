import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsAfter, IsFutureDate, IsSameDate } from '../../utils/decorators';

export class AppointmentCreateDto {
  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  scheduledDate: Date;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  @IsSameDate('scheduledDate')
  startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  @IsSameDate('scheduledDate')
  @IsAfter('startTime')
  endTime: Date;

  @IsString()
  @IsOptional()
  description?: string | null;
}
