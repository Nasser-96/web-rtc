import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import ReturnResponse from './helper/returnResponse';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import FrontEndUrl from './helper/front-end-url';
import { AppointmentType, ValidateLinkType } from './types&enums/types';
import { AppGateway } from './socket/socket.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  public professionalAppointments: AppointmentType[] = [];
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly eventsGateway: AppGateway,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAllUsers() {
    const users = await this.prismaService.user.findMany();
    return ReturnResponse(users);
  }

  async getUserLink() {
    const uuid = uuidv4();

    const appointmentData = {
      professionalFullName: 'Mark John Doe',
      appointmentDate: Date.now() + 1000000,
      uuid,
    };
    this.professionalAppointments.push(appointmentData);
    const linkToken = this.jwtService.sign(appointmentData, {
      secret: process.env.JSON_TOKEN_KEY,
    });
    return ReturnResponse({
      link: `${FrontEndUrl()}/join-video?token=${linkToken}`,
    });
  }

  async validateLink(data: ValidateLinkType) {
    try {
      const decodedData = this.jwtService.verify(data.token, {
        secret: process.env.JSON_TOKEN_KEY,
      });

      console.log(this.professionalAppointments);

      return ReturnResponse(decodedData);
    } catch (error) {
      throw new HttpException(
        ReturnResponse('', 'Token Expired'),
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  socket() {
    this.eventsGateway.emitToAll('test', ReturnResponse({ data: 'GGs' }));
  }
}
