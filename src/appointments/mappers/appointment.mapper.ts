import { Appointment } from '../entities/appointment.entity';
import { Request } from 'express';
import { AppointmentResponseType } from '../../common/types/appointment-response.type';

export class AppointmentMapper {
  constructor(private appointment: Appointment) {}

  toFileLinksList(req: Request): AppointmentResponseType {
    return {
      ...Object.assign(this.appointment),
      files: this.appointment.files.map(
        ({ fileLink }) => `${req.protocol}://${req.get('host')}/${fileLink}`,
      ),
    };
  }
}
