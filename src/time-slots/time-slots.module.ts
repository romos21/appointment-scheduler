import { forwardRef, Module } from '@nestjs/common';
import { TimeSlotsController } from './time-slots.controller';
import { TimeSlotsService } from './time-slots.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
  imports: [
    TypeOrmModule.forFeature([TimeSlot]),
    forwardRef(() => AppointmentsModule),
  ],
})
export class TimeSlotsModule {}
