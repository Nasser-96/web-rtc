import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import ReturnResponse from './helper/returnResponse';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import FrontEndUrl from './helper/front-end-url';
import { ValidateLinkType } from './types&enums/types';
import { AppGateway } from './socket/socket.gateway';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly eventsGateway: AppGateway,
  ) {}

  private linkSecret = 'djgbosubauldsnlfnadogubeuigs';

  getHello(): string {
    return 'Hello World!';
  }

  async getAllUsers() {
    const users = await this.prismaService.user.findMany();
    return ReturnResponse(users);
  }

  async getUserLink() {
    const appData = {
      professionalFullName: 'Mark John Doe',
      appointmentDate: Date.now() + 1000000,
    };
    const linkToken = this.jwtService.sign(appData, {
      secret: this.linkSecret,
    });
    return ReturnResponse({
      link: `${FrontEndUrl()}/join-video?token=${linkToken}`,
    });
  }

  async validateLink(data: ValidateLinkType) {
    try {
      const decodedData = this.jwtService.verify(data.token, {
        secret: this.linkSecret,
      });

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
