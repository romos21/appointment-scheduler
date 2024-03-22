import { forwardRef, Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { UsersModule } from '../users/users.module';
import { TimeSlotsModule } from '../time-slots/time-slots.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentFile } from './entities/appointment-files.entity';
import { FileUploaderModule } from '../file-uploader/file-uploader.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentFile]),
    FileUploaderModule.forFeature('/appointments'),
    TimeSlotsModule,
    forwardRef(() => UsersModule),
  ],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
