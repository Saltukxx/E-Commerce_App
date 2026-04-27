import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('maps concurrent duplicate email writes to ConflictException', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique failed', {
            code: 'P2002',
            clientVersion: 'test',
          }),
        ),
      },
    };
    const service = new UsersService(prisma as never);

    await expect(
      service.register({
        email: 'taken@example.com',
        name: 'Taken',
        password: 'password1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
