import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TimeSlotsModule } from './time-slots/time-slots.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { FileUploaderModule } from './file-uploader/file-uploader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('database'),
    }),
    FileUploaderModule,
    UsersModule,
    TimeSlotsModule,
    AppointmentsModule,
    FileUploaderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
