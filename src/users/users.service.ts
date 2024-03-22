import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './dto/user-create.dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => AppointmentsService))
    private appointmentsService: AppointmentsService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUser(
    criteria: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User> {
    const user = await this.userRepository.findOneBy(criteria);
    if (!user) {
      throw new NotFoundException('User was not found');
    }
    return user;
  }

  async getUserAppointments(id: string): Promise<Appointment[]> {
    const user = await this.getUser({ id });
    return await this.appointmentsService.getAppointmentsByUser(user);
  }

  async createUser(userData: UserCreateDto): Promise<User> {
    const { email, phoneNumber } = userData;
    const userWithSameEmail = await this.userRepository.findOneBy({ email });
    if (userWithSameEmail) {
      throw new BadRequestException(`user with email ${email} already exist`);
    }
    const userWithSamePhoneNumber = await this.userRepository.findOneBy({
      phoneNumber,
    });
    if (userWithSamePhoneNumber) {
      throw new BadRequestException(
        `user with phone number ${phoneNumber} already exist`,
      );
    }
    const newUser = new User();
    Object.assign(newUser, userData);
    return await this.userRepository.save(newUser);
  }

  async deleteUser(userId: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ id: userId });
  }
}
