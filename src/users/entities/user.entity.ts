import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import {
  DEFAULT_STRING_LENGTH_LIMIT,
  PHONE_LENGTH_LIMIT,
} from '../../common/constants';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: DEFAULT_STRING_LENGTH_LIMIT,
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: DEFAULT_STRING_LENGTH_LIMIT,
    nullable: false,
  })
  lastName: string;

  @Column({
    name: 'email',
    unique: true,
    type: 'varchar',
    length: DEFAULT_STRING_LENGTH_LIMIT,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'phone_number',
    unique: true,
    type: 'varchar',
    length: PHONE_LENGTH_LIMIT,
    nullable: false,
  })
  phoneNumber: string;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
