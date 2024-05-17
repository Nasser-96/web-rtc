import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Login, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup')
  async signup(@Body() body: SignupDto) {
    return this.authService?.signup(body);
  }

  @Post('/login')
  signin(@Body() body: Login) {
    return this.authService?.login(body);
  }

  @Post('/update-username')
  updateUserName(
    @Headers('authorization') token: string,
    @Body() newName: { username: string },
  ) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }
    return this.authService?.updateUserName(token, newName.username);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile() {
    return;
  }
}
