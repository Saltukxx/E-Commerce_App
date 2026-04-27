import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const REFRESH_TOKEN_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id, expiresAt: { lte: new Date() } },
    });
    return this.buildTokensForUser(user.id);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const stored = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });
      if (!stored) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const revoked = await tx.refreshToken.updateMany({
        where: {
          id: stored.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });
      if (revoked.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.buildTokensForUserWithClient(stored.userId, tx);
    });
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { msg: 'Logged out' };
  }

  private async buildTokensForUser(userId: number) {
    return this.buildTokensForUserWithClient(userId, this.prisma);
  }

  private async buildTokensForUserWithClient(
    userId: number,
    prisma: Pick<PrismaService, 'refreshToken'>,
  ) {
    const access_token = await this.jwt.signAsync(
      { sub: userId },
      { expiresIn: '15m' },
    );
    const refresh_token = this.createRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashRefreshToken(refresh_token),
        expiresAt,
      },
    });
    return {
      access_token,
      refresh_token,
    };
  }

  private createRefreshToken() {
    return randomBytes(64).toString('base64url');
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
