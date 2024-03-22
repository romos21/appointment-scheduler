import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Between,
  DataSource,
  DeleteResult,
  QueryRunner,
  Repository,
} from 'typeorm';
import { AppointmentCreateDto } from './dto/appointment-create.dto';
import { Appointment } from './entities/appointment.entity';
import { UsersService } from '../users/users.service';
import { TimeSlotsService } from '../time-slots/time-slots.service';
import { AppointmentFile } from './entities/appointment-files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class AppointmentsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentFile)
    private appointmentFileRepository: Repository<AppointmentFile>,
    @Inject(forwardRef(() => TimeSlotsService))
    private timeSlotsService: TimeSlotsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async getAppointment(
    criteria: FindOptionsWhere<Appointment>[] | FindOptionsWhere<Appointment>,
  ): Promise<Appointment> {
    return await this.appointmentRepository.findOne({
      where: criteria,
      relations: ['timeSlot', 'user', 'files'],
    });
  }

  async checkAppointmentTimeAvailability(
    scheduledDate: Date,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const formattedScheduledDate = new Date(scheduledDate);
    const formattedStartTime = new Date(startTime);
    const formattedEndTime = new Date(endTime);
    const existedAppointment = await this.appointmentRepository.findOneBy([
      {
        scheduledDate: formattedScheduledDate,
        startTime: Between(formattedStartTime, formattedEndTime),
      },
      {
        scheduledDate: formattedScheduledDate,
        endTime: Between(formattedStartTime, formattedEndTime),
      },
    ]);
    if (existedAppointment) {
      throw new BadRequestException('This time is not available');
    }
  }

  async getAppointmentsByUser(user: User): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { user },
      relations: ['timeSlot', 'files'],
    });
  }

  async saveAppointmentFiles(
    queryRunner: QueryRunner,
    files: Express.Multer.File[],
    appointment: Appointment,
  ): Promise<AppointmentFile[]> {
    const fileEntitiesList = [];
    for (const file of files) {
      const newFileEntity = await queryRunner.manager.create(AppointmentFile, {
        fileLink: file.path,
        appointment,
      });
      fileEntitiesList.push(newFileEntity);
    }
    return await queryRunner.manager.save(fileEntitiesList);
  }

  async createAppointment(
    userId: string,
    timeSlotId: string,
    data: AppointmentCreateDto,
    files: Express.Multer.File[],
  ): Promise<Appointment> {
    const user = await this.usersService.getUser({ id: userId });

    const timeSlot = await this.timeSlotsService.getTimeSlot({
      id: timeSlotId,
    });

    await this.checkAppointmentTimeAvailability(
      data.scheduledDate,
      data.startTime,
      data.endTime,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newAppointment;
    try {
      newAppointment = await queryRunner.manager.create(Appointment, {
        ...data,
        timeSlot,
        user,
      });
      await queryRunner.manager.save(newAppointment);
      newAppointment.files = await this.saveAppointmentFiles(
        queryRunner,
        files,
        newAppointment,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
    return newAppointment;
  }

  async deleteAppointment(id: string): Promise<DeleteResult> {
    return await this.appointmentRepository.delete({ id });
  }
}
