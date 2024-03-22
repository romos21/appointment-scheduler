import { Appointment } from '../../appointments/entities/appointment.entity';

export type AppointmentResponseType = Omit<
  Appointment,
  'files' | 'generateId'
> & {
  files: string[];
};
