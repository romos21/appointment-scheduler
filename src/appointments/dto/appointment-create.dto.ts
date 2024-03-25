import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsAfter, IsFutureDate, IsSameDate } from '../../utils/decorators';
import { COMMUTE_METHOD_TYPES } from '../../common/constants';

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

  @IsOptional()
  @IsEnum(COMMUTE_METHOD_TYPES)
  commuteMethod: COMMUTE_METHOD_TYPES;
}
