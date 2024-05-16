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
  public professionalAppointments: AppointmentType[] = [
    {
      professionalsFullName: 'nasser',
      appointmentDate: Date.now() + 500000,
      uuid: '1',
      clientName: 'Jim Jones',
    },
    {
      professionalsFullName: 'nasser',
      appointmentDate: Date.now() - 2000000,
      uuid: '2', // uuid:'u'uidv4(),
      clientName: 'Akash Patel',
    },
    {
      professionalsFullName: 'nasser',
      appointmentDate: Date.now() + 10000000,
      uuid: '3', //uuid:'u'uidv4(),
      clientName: 'Mike Williams',
    },
  ];
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

  async getUserLink(token: string) {
    const decodedToken = this.jwtService.verify(token, {
      secret: process.env.JSON_TOKEN_KEY,
    });

    const appointmentData = this.professionalAppointments[0];

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

      return ReturnResponse(decodedData);
    } catch (error) {
      throw new HttpException(
        ReturnResponse('', 'Token Expired'),
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  getProLink(token: string) {
    const decodedData = this.jwtService.verify(token, {
      secret: process.env.JSON_TOKEN_KEY,
    });

    const userData = {
      fullName: decodedData?.username,
      proId: decodedData?.id,
    };
    const linkToken = this.jwtService.sign(userData, {
      secret: process.env.JSON_TOKEN_KEY,
    });

    return ReturnResponse({
      link: `${FrontEndUrl()}/dashboard?token=${linkToken}`,
    });
  }

  socket() {
    this.eventsGateway.emitToAll('test', ReturnResponse({ data: 'GGs' }));
  }
}
