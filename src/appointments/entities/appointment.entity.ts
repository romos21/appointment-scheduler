import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { DESCRIPTION_LENGTH_LIMIT } from '../../common/constants';
import { AppointmentFile } from './appointment-files.entity';
import { TimeSlot } from '../../time-slots/entities/time-slot.entity';
import { User } from '../../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'scheduled_date',
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  scheduledDate: Date;

  @Column({
    name: 'start_time',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  endTime: Date;

  @Column({
    name: 'description',
    type: 'varchar',
    length: DESCRIPTION_LENGTH_LIMIT,
    nullable: true,
    default: null,
  })
  description: string;

  @OneToMany(() => AppointmentFile, (file) => file.appointment)
  files: AppointmentFile[];

  @ManyToOne(() => TimeSlot, (timeSlot) => timeSlot.appointments)
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlot;

  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
