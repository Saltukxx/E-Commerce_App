import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { APPLICATION_STATUS } from '../common/marketplace';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      orderGroupCount,
      pendingApplications,
      pendingPriceInquiries,
      activeStores,
      productCount,
    ] = await Promise.all([
      this.prisma.orderGroup.count(),
      this.prisma.storeApplication.count({
        where: { status: APPLICATION_STATUS.PENDING },
      }),
      this.prisma.priceInquiry.count({ where: { status: 'pending' } }),
      this.prisma.store.count({ where: { status: 'active' } }),
      this.prisma.product.count(),
    ]);

    const recentOrders = await this.prisma.orderGroup.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: {
        id: true,
        grandTotal: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    return {
      data: {
        orderGroupCount,
        pendingApplications,
        pendingPriceInquiries,
        activeStores,
        productCount,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          grandTotal: o.grandTotal,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt.toISOString(),
        })),
      },
      msg: 'Dashboard stats',
    };
  }
}
