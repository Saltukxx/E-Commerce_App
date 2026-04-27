import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddCartDto } from './cart/dto/add-cart.dto';
import { AddressOrderDto } from './orders/dto/address-order.dto';
import { RegisterDto } from './users/dto/register.dto';

describe('DTO validation', () => {
  it('rejects excessive cart quantities', async () => {
    const dto = plainToInstance(AddCartDto, {
      productId: 1,
      productName: 'Product',
      price: 100,
      quantity: 100,
      userId: 1,
    });

    await expect(validate(dto)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'quantity' }),
      ]),
    );
  });

  it('trims and rejects whitespace-only address fields', async () => {
    const dto = plainToInstance(AddressOrderDto, {
      addressLine: '   ',
      city: ' Berlin ',
      state: 'BE',
      postalCode: '10115',
      country: 'DE',
    });

    const errors = await validate(dto);

    expect(dto.city).toBe('Berlin');
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'addressLine' }),
      ]),
    );
  });

  it('trims registration text fields and rejects short passwords', async () => {
    const dto = plainToInstance(RegisterDto, {
      name: ' Alice ',
      email: ' alice@example.com ',
      password: 'short',
    });

    const errors = await validate(dto);

    expect(dto.name).toBe('Alice');
    expect(dto.email).toBe('alice@example.com');
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'password' }),
      ]),
    );
  });
});
