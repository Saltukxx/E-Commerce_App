import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorLedgerService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  isPlatformLedgerMode(): boolean {
    return this.config.get<string>('PAYOUT_MODE') === 'platform_ledger';
  }

  async creditFromOrder(order: { id: number; storeId: number; totalAmount: number }) {
    if (!this.isPlatformLedgerMode()) return;

    const feePercent = Number(this.config.get<string>('PLATFORM_FEE_PERCENT') ?? '0');
    const grossCents = Math.round(order.totalAmount * 100);
    const netCents = Math.round(grossCents * (1 - feePercent / 100));

    const existing = await this.prisma.vendorLedgerEntry.findFirst({
      where: { storeId: order.storeId, orderId: order.id, type: 'order_credit' },
    });
    if (existing) return;

    await this.prisma.vendorLedgerEntry.create({
      data: {
        storeId: order.storeId,
        type: 'order_credit',
        amountCents: netCents,
        orderId: order.id,
        note: `Order #${order.id}`,
      },
    });
  }

  async getBalanceCents(storeId: number): Promise<number> {
    const rows = await this.prisma.vendorLedgerEntry.groupBy({
      by: ['type'],
      where: { storeId },
      _sum: { amountCents: true },
    });
    let balance = 0;
    for (const row of rows) {
      const sum = row._sum.amountCents ?? 0;
      if (row.type === 'order_credit' || row.type === 'adjustment') {
        balance += sum;
      } else if (row.type === 'payout_debit') {
        balance -= sum;
      }
    }
    return balance;
  }

  async getPendingPayoutCents(storeId: number): Promise<number> {
    const pending = await this.prisma.payoutRequest.aggregate({
      where: { storeId, status: { in: ['pending', 'approved'] } },
      _sum: { amountCents: true },
    });
    return pending._sum.amountCents ?? 0;
  }
}
