import {

  BadRequestException,

  Injectable,

  Logger,

  NotFoundException,

} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { PRODUCT_STATUS, STORE_STATUS } from '../common/marketplace';
import { INQUIRY_STATUS } from './price-inquiry.constants';
@Injectable()

export class PriceInquiriesService {

  private readonly log = new Logger(PriceInquiriesService.name);



  constructor(private prisma: PrismaService) {}



  async create(userId: number, productId: number) {

    const product = await this.prisma.product.findUnique({

      where: { id: productId },

      include: { store: true },

    });

    if (!product) {

      throw new NotFoundException('Product not found');

    }

    if (product.status !== PRODUCT_STATUS.ACTIVE) {

      throw new BadRequestException('Product is not available');

    }

    if (product.store.status !== STORE_STATUS.ACTIVE) {

      throw new BadRequestException('This seller is not currently active');

    }

    if (product.price !== 0) {

      throw new BadRequestException(

        'This product has a list price; add it to the cart instead.',

      );

    }



    const existing = await this.prisma.priceInquiry.findFirst({

      where: {

        userId,

        productId,

        status: INQUIRY_STATUS.PENDING,

      },

    });

    if (existing) {

      return {

        data: { id: existing.id, status: existing.status },

        msg: 'Price inquiry already pending',

      };

    }



    const user = await this.prisma.user.findUnique({

      where: { id: userId },

      select: { email: true, name: true },

    });

    const row = await this.prisma.priceInquiry.create({

      data: {

        userId,

        productId,

        storeId: product.storeId,

        productName: product.title,

        userEmail: user?.email ?? '',

        status: INQUIRY_STATUS.PENDING,

      },

    });

    this.log.warn(

      `Price inquiry #${row.id}: user ${userId} (${user?.email ?? '?'}) wants quote for product ${productId} "${product.title}" (store ${product.storeId})`,

    );

    return {

      data: { id: row.id, status: row.status },

      msg: 'Price inquiry recorded',

    };

  }



  async listForAdmin() {

    const rows = await this.prisma.priceInquiry.findMany({

      orderBy: { createdAt: 'desc' },

      take: 500,

      include: {

        user: { select: { id: true, email: true, name: true } },

        product: { select: { id: true, slug: true, title: true } },

        store: { select: { id: true, name: true, slug: true } },

      },

    });

    return { data: rows, msg: 'Price inquiries' };

  }



  async listForUser(userId: number) {

    const rows = await this.prisma.priceInquiry.findMany({

      where: { userId },

      orderBy: { createdAt: 'desc' },

      take: 100,

      include: {

        product: { select: { id: true, slug: true, title: true, images: true } },

        store: { select: { id: true, name: true, slug: true } },

      },

    });

    return { data: rows, msg: 'Your price inquiries' };

  }



  async updateStatus(

    inquiryId: number,

    status: string,

    quoteCents?: number,

    adminNote?: string,

  ) {

    const row = await this.prisma.priceInquiry.findUnique({

      where: { id: inquiryId },

    });

    if (!row) {

      throw new NotFoundException('Price inquiry not found');

    }

    const allowed = Object.values(INQUIRY_STATUS) as string[];

    if (!allowed.includes(status)) {

      throw new BadRequestException(`status must be one of: ${allowed.join(', ')}`);

    }

    const updated = await this.prisma.priceInquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        quoteCents: quoteCents ?? null,
        adminNote: adminNote ?? row.adminNote,
        ...(status === INQUIRY_STATUS.QUOTED && row.quotedAt == null
          ? { quotedAt: new Date() }
          : {}),
      },
    });

    return { data: updated, msg: 'Price inquiry updated' };

  }

}


