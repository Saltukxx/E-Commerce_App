import {

  BadRequestException,

  Injectable,

  NotFoundException,

} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { mapCartItem } from '../common/mappers';

import { AddCartDto } from './dto/add-cart.dto';

import {

  computeVendorTotals,

  cartLineSellabilityIssue,

  PRODUCT_STATUS,

  STORE_STATUS,

} from '../common/marketplace';



@Injectable()

export class CartService {

  constructor(private prisma: PrismaService) {}



  private cartResponse(data: ReturnType<typeof mapCartItem>[], msg: string) {

    return { data, msg };

  }



  async getCart(userId: number) {

    const lines = await this.prisma.cartLine.findMany({

      where: { userId },

      orderBy: { id: 'asc' },

    });

    return this.cartResponse(

      lines.map((l) => mapCartItem(l)),

      'Cart',

    );

  }



  async add(userId: number, dto: AddCartDto) {

    if (dto.userId !== userId) {

      throw new BadRequestException('userId mismatch');

    }

    const product = await this.prisma.product.findUnique({

      where: { id: dto.productId },

      include: { store: true },

    });

    if (!product) {

      throw new NotFoundException('Product not found');

    }

    if (product.status !== PRODUCT_STATUS.ACTIVE) {

      throw new BadRequestException('Product is not available');

    }

    if (product.store.status !== STORE_STATUS.ACTIVE) {

      throw new BadRequestException('This seller is not currently accepting orders');

    }

    if (product.price === 0) {

      throw new BadRequestException(

        'This product has no list price. Request a quote from the product page.',

      );

    }

    const existing = await this.prisma.cartLine.findUnique({
      where: {
        userId_productId: { userId, productId: dto.productId },
      },
    });
    const nextQty = (existing?.quantity ?? 0) + dto.quantity;
    if (product.stockQty != null && nextQty > product.stockQty) {
      throw new BadRequestException(
        `Only ${product.stockQty} unit(s) available for this product`,
      );
    }

    const imageUrl = product.images[0] ?? null;

    await this.prisma.cartLine.upsert({

      where: {

        userId_productId: {

          userId,

          productId: dto.productId,

        },

      },

      update: {

        quantity: { increment: dto.quantity },

        productName: product.title,

        price: product.price,

        imageUrl,

        storeId: product.storeId,

        storeName: product.store.name,

      },

      create: {

        userId,

        productId: dto.productId,

        storeId: product.storeId,

        storeName: product.store.name,

        quantity: dto.quantity,

        productName: product.title,

        price: product.price,

        imageUrl,

        name: '',

      },

    });

    return this.getCart(userId);

  }



  async updateQuantity(

    userId: number,

    cartItemId: number,

    dto: AddCartDto,

  ) {

    if (dto.userId !== userId) {

      throw new BadRequestException('userId mismatch');

    }

    const line = await this.prisma.cartLine.findFirst({

      where: { id: cartItemId, userId },

      include: { product: { include: { store: true } } },

    });

    if (!line) {

      throw new NotFoundException('Cart line not found');

    }

    if (line.product.status !== PRODUCT_STATUS.ACTIVE) {

      throw new BadRequestException('Product is not available');

    }
    if (
      line.product.stockQty != null &&
      dto.quantity > line.product.stockQty
    ) {
      throw new BadRequestException(
        `Only ${line.product.stockQty} unit(s) available for this product`,
      );
    }

    if (line.product.store.status !== STORE_STATUS.ACTIVE) {

      throw new BadRequestException('This seller is not currently accepting orders');

    }

    if (line.product.price === 0) {

      throw new BadRequestException(

        'This product has no list price. Request a quote from the product page.',

      );

    }

    const imageUrl = line.product.images[0] ?? null;

    await this.prisma.cartLine.update({

      where: { id: line.id },

      data: {

        quantity: dto.quantity,

        productName: line.product.title,

        price: line.product.price,

        imageUrl,

        storeId: line.product.storeId,

        storeName: line.product.store.name,

      },

    });

    return this.getCart(userId);

  }



  async deleteLine(userId: number, cartItemId: number) {

    const line = await this.prisma.cartLine.findFirst({

      where: { id: cartItemId, userId },

    });

    if (!line) {

      throw new NotFoundException('Cart line not found');

    }

    await this.prisma.cartLine.delete({ where: { id: line.id } });

    return this.getCart(userId);

  }



  async summary(userId: number) {

    const lines = await this.prisma.cartLine.findMany({

      where: { userId },

      include: { product: { include: { store: true } } },

      orderBy: { id: 'asc' },

    });

    const warnings: string[] = [];

    const validLines = lines.filter((line) => {

      const issue = cartLineSellabilityIssue({

        product: line.product,

        productName: line.productName,

        storeName: line.storeName,

      });

      if (issue) {

        warnings.push(issue);

        return false;

      }

      return true;

    });



    const groupMap = new Map<

      number,

      {

        storeId: number;

        storeName: string;

        items: ReturnType<typeof mapCartItem>[];

        subtotalCents: number;

      }

    >();



    for (const line of validLines) {

      let group = groupMap.get(line.storeId);

      if (!group) {

        group = {

          storeId: line.storeId,

          storeName: line.storeName,

          items: [],

          subtotalCents: 0,

        };

        groupMap.set(line.storeId, group);

      }

      const priceCents = line.product.price;

      group.items.push(

        mapCartItem({

          ...line,

          price: priceCents,

        }),

      );

      group.subtotalCents += priceCents * line.quantity;

    }



    const groups = [...groupMap.values()].map((g) => {

      const totals = computeVendorTotals(g.subtotalCents);

      return {

        storeId: g.storeId,

        storeName: g.storeName,

        items: g.items,

        subtotal: totals.subtotal,

        shipping: totals.shipping,

        tax: totals.tax,

        total: totals.total,

      };

    });



    const grandSubtotal = groups.reduce((s, g) => s + g.subtotal, 0);

    const grandShipping = groups.reduce((s, g) => s + g.shipping, 0);

    const grandTax = groups.reduce((s, g) => s + g.tax, 0);

    const grandTotal = groups.reduce((s, g) => s + g.total, 0);

    const items = validLines.map((l) =>

      mapCartItem({ ...l, price: l.product.price }),

    );



    return {

      data: {

        groups,

        warnings,

        grandSubtotal,

        grandShipping,

        grandTax,

        grandTotal,

        discount: 0,

        items,

        subtotal: grandSubtotal,

        shipping: grandShipping,

        tax: grandTax,

        total: grandTotal,

      },

      msg: 'Checkout Summary',

    };

  }

}


