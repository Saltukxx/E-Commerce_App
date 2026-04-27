import { BadRequestException } from '@nestjs/common';
import { ProductsController } from './products.controller';

describe('ProductsController', () => {
  it('rejects invalid category ids', () => {
    const controller = new ProductsController({ findAll: jest.fn() } as never);

    expect(() => controller.findAll('abc')).toThrow(BadRequestException);
    expect(() => controller.findAll('-1')).toThrow(BadRequestException);
  });
});
