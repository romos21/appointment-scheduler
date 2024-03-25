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
  UpdateResult,
} from 'typeorm';
import { AppointmentCreateDto } from './dto/appointment-create.dto';
import { Appointment } from './entities/appointment.entity';
import { UsersService } from '../users/users.service';
import { TimeSlotsService } from '../time-slots/time-slots.service';
import { AppointmentFile } from './entities/appointment-files.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { TimeSlot } from '../time-slots/entities/time-slot.entity';
import { COMMUTE_METHOD_TYPES, TIME_SLOT_TYPES } from '../common/constants';
import * as moment from 'moment';
import { RRuleSet, rrulestr } from 'rrule';
import { isTimeAfter, isTimeBefore } from '../utils/helpers';

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

  private async checkAppointmentTimeAvailability(
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

  private checkAppointmentTimeSlotDateTimeRelation(
    appointment: Appointment | AppointmentCreateDto,
    timeslot: TimeSlot,
  ) {
    let isCorrectScheduledDate = !!appointment.scheduledDate;
    if (timeslot.type === TIME_SLOT_TYPES.RECURRING) {
      if (!timeslot.recurringRule) {
        throw new BadRequestException(
          'there is no recurring rule for timeslot',
        );
      }
      const rruleSet = new RRuleSet();
      const rule = rrulestr(timeslot.recurringRule, {
        forceset: true,
      });
      rruleSet.rrule(rule);
      const scheduledDate = new Date(appointment.scheduledDate);
      const startOfScheduledDay = moment(scheduledDate).startOf('day').toDate();
      const endOfScheduledDay = moment(scheduledDate).endOf('day').toDate();
      isCorrectScheduledDate =
        rule.between(startOfScheduledDay, endOfScheduledDay).length > 0;
    } else {
      isCorrectScheduledDate = moment(appointment.scheduledDate).isSame(
        moment(timeslot.startDate),
      );
    }
    if (!isCorrectScheduledDate) {
      throw new BadRequestException(
        'appointment scheduled date is not available for this timeslot',
      );
    }
    const isCorrectTime: boolean =
      isTimeAfter(appointment.startTime, timeslot.startTime) &&
      isTimeBefore(appointment.endTime, timeslot.endTime);
    if (!isCorrectTime) {
      throw new BadRequestException(
        'appointment time range is not available for this timeslot',
      );
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
    const fileEntitiesList = await Promise.all(
      files.map((file) =>
        queryRunner.manager.create(AppointmentFile, {
          fileLink: file.path,
          appointment,
        }),
      ),
    );
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

    this.checkAppointmentTimeSlotDateTimeRelation(data, timeSlot);
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
      if (!data.commuteMethod) {
        data.commuteMethod = timeSlot.commuteMethod;
      }
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

  async updateRelatedAppointmentsCommuteMethod(
    timeSlot: TimeSlot,
    commuteMethod: COMMUTE_METHOD_TYPES,
  ) {
    return await this.appointmentRepository.update(
      { timeSlot },
      { commuteMethod },
    );
  }

  async updateCommuteMethod(
    id: string,
    commuteMethod: COMMUTE_METHOD_TYPES,
  ): Promise<UpdateResult> {
    const appointment = await this.getAppointment({ id });
    if (appointment.timeSlot.type === TIME_SLOT_TYPES.SINGLE) {
      await this.timeSlotsService.updateCommuteMethod(
        appointment.timeSlot.id,
        commuteMethod,
      );
    }
    return await this.appointmentRepository.update({ id }, { commuteMethod });
  }
}
