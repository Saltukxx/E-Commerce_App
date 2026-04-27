import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  function serviceWith(prisma: Record<string, unknown>) {
    const jwt = {
      signAsync: jest.fn().mockResolvedValue('access.jwt'),
    } as unknown as JwtService;
    return {
      service: new AuthService(prisma as never, jwt),
      jwt,
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns distinct access and refresh tokens on login and stores only refresh hash', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 3,
          email: 'a@b.com',
          passwordHash: 'hash',
        }),
      },
      refreshToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const { service } = serviceWith(prisma);

    const tokens = await service.login('a@b.com', 'password');

    expect(tokens.access_token).toBe('access.jwt');
    expect(tokens.refresh_token).not.toBe(tokens.access_token);
    expect(tokens.refresh_token.length).toBeGreaterThan(32);
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 3, expiresAt: { lte: expect.any(Date) } },
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 3,
        tokenHash: expect.not.stringContaining(tokens.refresh_token),
      }),
    });
  });

  it('rotates valid refresh tokens with a conditional revoke', async () => {
    const tx = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 9,
          userId: 3,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: jest.fn((cb: (client: typeof tx) => Promise<unknown>) =>
        cb(tx),
      ),
    };
    const { service } = serviceWith(prisma);

    const tokens = await service.refresh('valid-refresh-token');

    expect(tokens.access_token).toBe('access.jwt');
    expect(tx.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: 9,
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { revokedAt: expect.any(Date) },
    });
    expect(tx.refreshToken.create).toHaveBeenCalled();
  });

  it('rejects refresh tokens that fail the conditional revoke', async () => {
    const tx = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 9,
          userId: 3,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const prisma = {
      $transaction: jest.fn((cb: (client: typeof tx) => Promise<unknown>) =>
        cb(tx),
      ),
    };
    const { service } = serviceWith(prisma);

    await expect(service.refresh('revoked-or-expired')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
