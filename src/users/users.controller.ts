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
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserCreateDto } from './dto/user-create.dto';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm';
import { AppointmentMapper } from '../appointments/mappers/appointment.mapper';
import { Request } from 'express';
import { AppointmentResponseType } from '../common/types/appointment-response.type';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return await this.usersService.getUser({ id });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: UserCreateDto): Promise<User> {
    return await this.usersService.createUser(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DeleteResult> {
    return await this.usersService.deleteUser(id);
  }

  @Get(':id/appointments')
  @HttpCode(HttpStatus.OK)
  async getUserAppointments(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AppointmentResponseType[]> {
    const appointments = await this.usersService.getUserAppointments(id);
    return appointments.map((appointment) =>
      new AppointmentMapper(appointment).toFileLinksList(req),
    );
  }
}
