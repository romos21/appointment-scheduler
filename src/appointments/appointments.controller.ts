import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  Req,
  Patch,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentCreateDto } from './dto/appointment-create.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AppointmentMapper } from './mappers/appointment.mapper';
import { Request } from 'express';
import { AppointmentResponseType } from '../common/types/appointment-response.type';
import { AppointmentUpdateCommuteMethodDto } from './dto/appointment-update-commute-method.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get(':id')
  async getAppointment(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AppointmentResponseType> {
    const appointment = await this.appointmentsService.getAppointment({ id });
    return new AppointmentMapper(appointment).toFileLinksList(req);
  }

  @Post(':time_slot_id')
  @UseInterceptors(FilesInterceptor('files'))
  @HttpCode(HttpStatus.CREATED)
  async createAppointment(
    @Req() req: Request,
    @Param('time_slot_id', new ParseUUIDPipe()) timeSlotId: string,
    @Query('user_id', new ParseUUIDPipe()) userId: string,
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body() body: AppointmentCreateDto,
  ): Promise<AppointmentResponseType> {
    const appointment = await this.appointmentsService.createAppointment(
      userId,
      timeSlotId,
      body,
      files,
    );
    return new AppointmentMapper(appointment).toFileLinksList(req);
  }

  @Delete(':id')
  async deleteAppointment(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DeleteResult> {
    return await this.appointmentsService.deleteAppointment(id);
  }

  @Patch(':id/commute-method')
  async updateCommuteMethod(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: AppointmentUpdateCommuteMethodDto,
  ): Promise<UpdateResult> {
    return await this.appointmentsService.updateCommuteMethod(
      id,
      query.commuteMethod,
    );
  }
}
