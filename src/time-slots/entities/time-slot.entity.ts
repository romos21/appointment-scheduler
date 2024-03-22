import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { TIME_SLOT_TYPES } from '../../common/constants';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TIME_SLOT_TYPES,
    nullable: false,
  })
  type: TIME_SLOT_TYPES;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  startDate: Date;

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

  @OneToMany(() => Appointment, (appointment) => appointment.timeSlot)
  appointments: Appointment[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
