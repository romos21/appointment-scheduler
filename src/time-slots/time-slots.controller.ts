import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { TimeSlotCreateDto } from './dto/time-slot-create.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { TimeSlotUpdateDto } from './dto/time-slot-update.dto';
import { TimeSlotUpdateCommuteMethodDto } from './dto/time-slot-update-commute-method.dto';

@Controller('time-slots')
export class TimeSlotsController {
  constructor(private timeSlotService: TimeSlotsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotService.getAllTimeSlots();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTimeSlot(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TimeSlot> {
    return await this.timeSlotService.getTimeSlot({ id });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTimeSlot(@Body() body: TimeSlotCreateDto): Promise<TimeSlot> {
    return await this.timeSlotService.createTimeSlot(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTimeSlot(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DeleteResult> {
    return await this.timeSlotService.deleteTimeSlot(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateTimeSlotDate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: TimeSlotUpdateDto,
  ): Promise<void> {
    return await this.timeSlotService.updateTimeSlotDate(
      id,
      body.currentDate,
      body.newDate,
    );
  }

  @Patch(':id/commute-method')
  async updateCommuteMethod(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: TimeSlotUpdateCommuteMethodDto,
  ): Promise<UpdateResult> {
    return await this.timeSlotService.updateTimeSlotCommuteMethod(
      id,
      query.commuteMethod,
    );
  }
}
