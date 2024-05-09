import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ValidateLinkType } from './types&enums/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('getUsers')
  getAllUsers() {
    return this.appService.getAllUsers();
  }

  @Get('user-link')
  async getUserLink() {
    return await this.appService.getUserLink();
  }

  @Post('validate-link')
  async validateLink(@Body() data: ValidateLinkType) {
    return await this.appService.validateLink(data);
  }

  @Post('test-socket')
  async socket() {
    return this.appService.socket();
  }
}
