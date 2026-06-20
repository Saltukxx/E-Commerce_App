import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapStore } from '../common/mappers';
import { buildStoreUpdateData, syncStoreFeaturedProducts } from '../common/store-profile';
import { PriceInquiriesService } from '../price-inquiries/price-inquiries.service';
import { StorefrontRevalidateService } from '../common/storefront-revalidate.service';

const ALLOWED_STATUSES = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private priceInquiries: PriceInquiriesService,
    private revalidate: StorefrontRevalidateService,
  ) {}

  async getStoreId(userId: number): Promise<number> {
    return this.getOwnedStoreId(userId);
  }

  private async getOwnedStore(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedStore: true },
    });
    if (user?.ownedStore == null) {
      throw new ForbiddenException('No store linked to this vendor account');
    }
    return user.ownedStore;
  }

  private async getOwnedStoreId(userId: number): Promise<number> {
    return (await this.getOwnedStore(userId)).id;
  }

  async ensureStoreWritable(userId: number) {
    const store = await this.getOwnedStore(userId);
    if (store.status === 'suspended') {
      throw new ForbiddenException('Store is suspended — changes are disabled');
    }
    return store.id;
  }

  async getStore(userId: number) {
    const storeId = await this.getOwnedStoreId(userId);
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        featuredProducts: { orderBy: { sortOrder: 'asc' }, select: { productId: true } },
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return {
      data: {
        ...mapStore(store),
        featuredProductIds: store.featuredProducts.map((fp) => fp.productId),
        productCount: store._count.products,
        orderCount: store._count.orders,
        payoutBankIban: store.payoutBankIban,
        payoutBankHolder: store.payoutBankHolder,
      },
      msg: 'Vendor store',
    };
  }

  async getOrder(userId: number, orderId: number) {
    const storeId = await this.getOwnedStoreId(userId);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        lines: true,
        store: true,
        user: { select: { id: true, name: true, email: true } },
        orderGroup: { select: { paymentStatus: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return { data: this.mapOrder(order), msg: 'Vendor order' };
  }

  private mapOrder(o: {
    id: number;
    orderGroupId: number | null;
    orderDate: Date;
    status: string;
    paymentStatus: string;
    subtotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    store: { name: string };
    user?: { id: number; name: string; email: string };
    orderGroup?: { paymentStatus: string } | null;
    lines: Array<{
      id: number;
      productId: number;
      productName: string;
      price: number;
      quantity: number;
    }>;
  }) {
    return {
      id: o.id,
      orderGroupId: o.orderGroupId ?? 0,
      orderDate: o.orderDate.toISOString().slice(0, 10),
      status: o.status,
      paymentStatus: o.orderGroup?.paymentStatus ?? o.paymentStatus,
      subtotal: o.subtotal,
      shipping: o.shipping,
      tax: o.tax,
      totalAmount: o.totalAmount,
      storeName: o.store.name,
      customer: o.user
        ? { id: o.user.id, name: o.user.name, email: o.user.email }
        : null,
      shippingAddress: {
        addressLine: o.addressLine,
        city: o.city,
        state: o.state,
        postalCode: o.postalCode,
        country: o.country,
      },
      items: o.lines.map((line) => ({
        id: line.id,
        productId: line.productId,
        productName: line.productName,
        price: line.price,
        quantity: line.quantity,
      })),
    };
  }

  async listOrders(userId: number, status?: string, skip = 0, limit = 50) {
    const storeId = await this.getOwnedStoreId(userId);
    const take = Math.min(limit, 100);
    const where = {
      storeId,
      ...(status?.trim() ? { status: status.trim() } : {}),
    };
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          lines: true,
          store: true,
          user: { select: { id: true, name: true, email: true } },
          orderGroup: { select: { paymentStatus: true } },
        },
        orderBy: { id: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data: orders.map((o) => this.mapOrder(o)),
      meta: { total, skip, limit: take },
      msg: 'Vendor orders',
    };
  }

  async updateOrderStatus(userId: number, orderId: number, status: string) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }
    const storeId = await this.getOwnedStoreId(userId);
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (store?.status === 'suspended') {
      throw new ForbiddenException('Store is suspended — order updates are disabled');
    }
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return { data: { id: updated.id, status: updated.status }, msg: 'Updated' };
  }

  async listPriceInquiries(userId: number) {
    const storeId = await this.getOwnedStoreId(userId);
    const rows = await this.prisma.priceInquiry.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, email: true, name: true } },
        product: { select: { id: true, slug: true, title: true } },
      },
    });
    return { data: rows, msg: 'Vendor price inquiries' };
  }

  async updateStore(
    userId: number,
    data: {
      description?: string;
      logo?: string;
      banner?: string;
      contactEmail?: string;
      phone?: string;
      deliveryArea?: string;
      city?: string;
      website?: string;
      certifications?: string[];
      featuredProductIds?: number[];
    },
  ) {
    const storeId = await this.ensureStoreWritable(userId);
    if (data.featuredProductIds != null) {
      await syncStoreFeaturedProducts(this.prisma, storeId, data.featuredProductIds);
    }
    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: buildStoreUpdateData(data),
    });
    void this.revalidate.revalidate(['/', '/katalog', '/haendler', `/shop/${updated.slug}`]);
    return { data: mapStore(updated), msg: 'Store updated' };
  }

  async updatePriceInquiry(
    userId: number,
    inquiryId: number,
    status: string,
    quoteCents?: number,
    adminNote?: string,
  ) {
    const storeId = await this.ensureStoreWritable(userId);
    const inquiry = await this.prisma.priceInquiry.findFirst({
      where: { id: inquiryId, storeId },
    });
    if (!inquiry) {
      throw new NotFoundException('Price inquiry not found');
    }
    return this.priceInquiries.updateStatus(
      inquiryId,
      status,
      quoteCents,
      adminNote,
    );
  }

  async listCategoriesForStore(storeId: number) {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { storeId } } } },
      },
    });
    return {
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        productCount: c._count.products,
      })),
      msg: 'Categories',
    };
  }
}
