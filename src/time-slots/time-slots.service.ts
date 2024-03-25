import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  DeleteResult,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { COMMUTE_METHOD_TYPES, TIME_SLOT_TYPES } from '../common/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeSlotCreateDto } from './dto/time-slot-create.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { RRule, RRuleSet, rrulestr } from 'rrule';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class TimeSlotsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    @Inject(forwardRef(() => AppointmentsService))
    private appointmentsService: AppointmentsService,
  ) {}

  async getAllTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotRepository.find();
  }

  async getTimeSlot(
    criteria: FindOptionsWhere<TimeSlot> | FindOptionsWhere<TimeSlot>[],
  ): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotRepository.findOneBy(criteria);
    if (!timeSlot) {
      throw new NotFoundException('TimeSlot was not found');
    }
    return timeSlot;
  }

  private createRecurringRule(startDate: Date) {
    const rruleSet = new RRuleSet();
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date(startDate),
    });
    rruleSet.rrule(rule);
    return rruleSet.toString();
  }

  private updateRecurringRule(
    currentDate: Date,
    newDate: Date,
    recurringRule: string,
  ) {
    const rruleSet = new RRuleSet();
    const rule = rrulestr(recurringRule, {
      forceset: true,
    });
    rruleSet.rrule(rule);
    rruleSet.rdate(new Date(newDate));
    rruleSet.exdate(new Date(currentDate));
    return rruleSet.toString();
  }

  async createTimeSlot(timeSlotData: TimeSlotCreateDto): Promise<TimeSlot> {
    if (timeSlotData.type === TIME_SLOT_TYPES.RECURRING) {
      timeSlotData.recurringRule = this.createRecurringRule(
        timeSlotData.startDate,
      );
    }
    const newTimeSlot = await this.timeSlotRepository.create(timeSlotData);
    return await this.timeSlotRepository.save(newTimeSlot);
  }

  async deleteTimeSlot(id: string): Promise<DeleteResult> {
    return await this.timeSlotRepository.delete({ id });
  }

  async updateTimeSlotDate(
    id: string,
    currentDate: Date,
    newDate: Date,
  ): Promise<void> {
    const timeSlot = await this.getTimeSlot({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (timeSlot.type === TIME_SLOT_TYPES.SINGLE) {
        await queryRunner.manager.update(
          TimeSlot,
          { id },
          { startDate: newDate },
        );
      } else if (timeSlot.type === TIME_SLOT_TYPES.RECURRING) {
        const { id, recurringRule } = timeSlot;
        await queryRunner.manager.update(
          TimeSlot,
          { id },
          {
            recurringRule: this.updateRecurringRule(
              currentDate,
              newDate,
              recurringRule,
            ),
          },
        );
      }
      await queryRunner.manager.update(
        Appointment,
        { timeSlot, scheduledDate: currentDate },
        { scheduledDate: newDate },
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async updateCommuteMethod(id: string, commuteMethod: COMMUTE_METHOD_TYPES) {
    return await this.timeSlotRepository.update({ id }, { commuteMethod });
  }

  async updateTimeSlotCommuteMethod(
    id: string,
    commuteMethod: COMMUTE_METHOD_TYPES,
  ): Promise<UpdateResult> {
    const timeSlot = await this.getTimeSlot({ id });
    await this.appointmentsService.updateRelatedAppointmentsCommuteMethod(
      timeSlot,
      commuteMethod,
    );
    return await this.updateCommuteMethod(id, commuteMethod);
  }
}
