import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtUser } from './strategies/jwt.strategy';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.auth.logout(dto.refresh_token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@User() user: JwtUser) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: user.userId } });
    return {
      id: u.id,
      email: u.email,
      password: '',
      name: u.name,
      role: u.role,
      avatar: u.avatar,
    };
  }
}
