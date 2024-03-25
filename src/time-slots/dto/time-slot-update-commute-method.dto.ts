import { IsEnum, IsOptional } from 'class-validator';
import { COMMUTE_METHOD_TYPES } from '../../common/constants';

export class TimeSlotUpdateCommuteMethodDto {
  @IsOptional()
  @IsEnum(COMMUTE_METHOD_TYPES)
  commuteMethod: COMMUTE_METHOD_TYPES;
}
