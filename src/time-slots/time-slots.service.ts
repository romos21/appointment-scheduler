import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  DeleteResult,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { TIME_SLOT_TYPES } from '../common/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeSlotCreateDto } from './dto/time-slot-create.dto';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class TimeSlotsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
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

  async createTimeSlot(timeSlotData: TimeSlotCreateDto): Promise<TimeSlot> {
    const newTimeSlot = new TimeSlot();
    Object.assign(newTimeSlot, timeSlotData);
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
        await queryRunner.manager.update(
          Appointment,
          { timeSlot, scheduledDate: currentDate },
          { scheduledDate: newDate },
        );
      } else if (timeSlot.type === TIME_SLOT_TYPES.RECURRING) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = timeSlot;
        const newTimeSlot = await queryRunner.manager.create(TimeSlot, {
          ...rest,
          type: TIME_SLOT_TYPES.SINGLE,
          startDate: newDate,
        });
        await queryRunner.manager.save(newTimeSlot);
        await queryRunner.manager.update(
          Appointment,
          { timeSlot, scheduledDate: currentDate },
          { timeSlot: newTimeSlot, scheduledDate: newDate },
        );
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
