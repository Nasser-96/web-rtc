import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
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
  async getUserLink(@Headers('authorization') token: string) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    return await this.appService.getUserLink(token);
  }

  @Post('validate-link')
  async validateLink(@Body() data: ValidateLinkType) {
    return await this.appService.validateLink(data);
  }

  @Get('pro-link')
  getProLink(@Headers('authorization') token: string) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }
    return this.appService.getProLink(token);
  }

  @Post('test-socket')
  async socket() {
    return this.appService.socket();
  }
}
