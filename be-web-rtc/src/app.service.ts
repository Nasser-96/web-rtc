import { Injectable } from '@nestjs/common';
import ReturnResponse from './helper/returnResponse';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAllUsers() {
    const users = await this.prismaService.user.findMany();
    return ReturnResponse(users);
  }
}
