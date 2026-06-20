import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorDashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(storeId: number, from?: Date, to?: Date) {
    const orderWhere = {
      storeId,
      paymentStatus: 'paid',
      ...(from || to
        ? {
            orderDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [
      orders,
      pendingOrders,
      pendingInquiries,
      productCount,
      lowStockCount,
      revenueAgg,
      topProducts,
      ordersByStatus,
      categoryBreakdown,
    ] = await Promise.all([
      this.prisma.order.count({ where: orderWhere }),
      this.prisma.order.count({ where: { storeId, status: 'Pending' } }),
      this.prisma.priceInquiry.count({ where: { storeId, status: 'pending' } }),
      this.prisma.product.count({ where: { storeId, status: 'active' } }),
      this.prisma.product.count({
        where: { storeId, status: 'active', stockQty: { lte: 5 } },
      }),
      this.prisma.order.aggregate({ where: orderWhere, _sum: { totalAmount: true } }),
      this.prisma.orderLine.groupBy({
        by: ['productId'],
        where: { storeId, order: orderWhere },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: { storeId },
        _count: { id: true },
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        where: { storeId, status: 'active' },
        _count: { id: true },
      }),
    ]);

    const productIds = topProducts.map((p) => p.productId);
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true, slug: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    const categoryIds = categoryBreakdown.map((c) => c.categoryId);
    const categories = categoryIds.length
      ? await this.prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const recentOrders = await this.prisma.order.findMany({
      where: { storeId },
      orderBy: { id: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    });

    const dailyRevenue = await this.prisma.$queryRaw<
      Array<{ day: Date; revenue: number }>
    >`
      SELECT DATE("orderDate") as day, SUM("totalAmount")::float as revenue
      FROM "Order"
      WHERE "storeId" = ${storeId} AND "paymentStatus" = 'paid'
      GROUP BY DATE("orderDate")
      ORDER BY day DESC
      LIMIT 30
    `;

    return {
      data: {
        orderCount: orders,
        pendingOrders,
        pendingInquiries,
        productCount,
        lowStockCount,
        revenueTotal: revenueAgg._sum.totalAmount ?? 0,
        topProducts: topProducts.map((row) => ({
          productId: row.productId,
          quantity: row._sum.quantity ?? 0,
          title: productMap.get(row.productId)?.title ?? '—',
          slug: productMap.get(row.productId)?.slug ?? '',
        })),
        ordersByStatus: ordersByStatus.map((r) => ({
          status: r.status,
          count: r._count.id,
        })),
        productsByCategory: categoryBreakdown.map((r) => ({
          categoryId: r.categoryId,
          categoryName: catMap.get(r.categoryId) ?? '—',
          count: r._count.id,
        })),
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          status: o.status,
          totalAmount: o.totalAmount,
          paymentStatus: o.paymentStatus,
          customerName: o.user.name,
          orderDate: o.orderDate.toISOString().slice(0, 10),
        })),
        dailyRevenue: dailyRevenue.map((r) => ({
          day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day),
          revenue: Number(r.revenue),
        })),
      },
      msg: 'Vendor stats',
    };
  }
}
