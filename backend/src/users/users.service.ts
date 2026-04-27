import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.createUser(dto, passwordHash);
    return {
      id: user.id,
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    };
  }

  private async createUser(dto: RegisterDto, passwordHash: string) {
    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          avatar: dto.avatar ?? '',
          role: 'customer',
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}
