import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Post('/')
  async register(@Body() dto: RegisterDto) {
    return this.users.register(dto);
  }
}
