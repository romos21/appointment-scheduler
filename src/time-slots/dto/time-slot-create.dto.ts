import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { COMMUTE_METHOD_TYPES, TIME_SLOT_TYPES } from '../../common/constants';
import { IsAfter, IsFutureDate, IsSameDate } from '../../utils/decorators';

export class TimeSlotCreateDto {
  @IsNotEmpty()
  @IsEnum(TIME_SLOT_TYPES)
  type: TIME_SLOT_TYPES;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  @IsSameDate('startDate')
  startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  @IsFutureDate()
  @IsAfter('startTime')
  @IsSameDate('startDate')
  endTime: Date;

  @IsOptional()
  @IsString()
  recurringRule: string;

  @IsNotEmpty()
  @IsEnum(COMMUTE_METHOD_TYPES)
  commuteMethod: COMMUTE_METHOD_TYPES;
}
