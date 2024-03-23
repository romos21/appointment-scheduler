import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('appointment_files')
export class AppointmentFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_link', type: 'varchar', nullable: false })
  fileLink: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.files)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
