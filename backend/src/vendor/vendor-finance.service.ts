import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VendorLedgerService } from './vendor-ledger.service';

@Injectable()
export class VendorFinanceService {
  constructor(
    private prisma: PrismaService,
    private ledger: VendorLedgerService,
  ) {}

  async getSummary(storeId: number) {
    const [availableCents, pendingPayoutCents, lifetime] = await Promise.all([
      this.ledger.getBalanceCents(storeId),
      this.ledger.getPendingPayoutCents(storeId),
      this.prisma.vendorLedgerEntry.aggregate({
        where: { storeId, type: 'order_credit' },
        _sum: { amountCents: true },
      }),
    ]);
    return {
      data: {
        availableCents: Math.max(0, availableCents - pendingPayoutCents),
        pendingPayoutCents,
        lifetimeEarnedCents: lifetime._sum.amountCents ?? 0,
      },
      msg: 'Finance summary',
    };
  }

  async listLedger(storeId: number, skip = 0, limit = 50) {
    const take = Math.min(limit, 100);
    const [rows, total] = await Promise.all([
      this.prisma.vendorLedgerEntry.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.vendorLedgerEntry.count({ where: { storeId } }),
    ]);
    return {
      data: rows,
      meta: { total, skip, limit: take },
      msg: 'Ledger',
    };
  }

  async listPayoutRequests(storeId: number) {
    const rows = await this.prisma.payoutRequest.findMany({
      where: { storeId },
      orderBy: { requestedAt: 'desc' },
    });
    return { data: rows, msg: 'Payout requests' };
  }

  async createPayoutRequest(
    storeId: number,
    amountCents: number,
    bankIban: string,
    bankHolder: string,
  ) {
    if (amountCents < 1000) {
      throw new BadRequestException('Minimum payout is €10.00');
    }
    const available = await this.ledger.getBalanceCents(storeId);
    const pending = await this.ledger.getPendingPayoutCents(storeId);
    const spendable = available - pending;
    if (amountCents > spendable) {
      throw new BadRequestException('Insufficient balance');
    }

    const req = await this.prisma.payoutRequest.create({
      data: {
        storeId,
        amountCents,
        bankIban: bankIban.trim(),
        bankHolder: bankHolder.trim(),
        status: 'pending',
      },
    });

    await this.prisma.store.update({
      where: { id: storeId },
      data: { payoutBankIban: bankIban.trim(), payoutBankHolder: bankHolder.trim() },
    });

    return { data: req, msg: 'Payout request created' };
  }

  async listAllPayoutRequests(status?: string) {
    const rows = await this.prisma.payoutRequest.findMany({
      where: status ? { status } : {},
      orderBy: { requestedAt: 'desc' },
      include: { store: { select: { id: true, name: true, slug: true } } },
    });
    return { data: rows, msg: 'Payout requests' };
  }

  async updatePayoutRequest(
    id: number,
    status: 'approved' | 'rejected' | 'paid',
    adminNote: string,
    adminId: number,
  ) {
    const req = await this.prisma.payoutRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Payout request not found');
    if (req.status === 'paid' || req.status === 'rejected') {
      throw new BadRequestException('Request already finalized');
    }

    if (status === 'paid') {
      await this.prisma.$transaction(async (tx) => {
        await tx.payoutRequest.update({
          where: { id },
          data: {
            status: 'paid',
            adminNote,
            processedAt: new Date(),
            processedByAdminId: adminId,
          },
        });
        await tx.vendorLedgerEntry.create({
          data: {
            storeId: req.storeId,
            type: 'payout_debit',
            amountCents: req.amountCents,
            payoutRequestId: id,
            note: adminNote || `Payout #${id}`,
          },
        });
      });
    } else {
      await this.prisma.payoutRequest.update({
        where: { id },
        data: {
          status,
          adminNote,
          processedAt: new Date(),
          processedByAdminId: adminId,
        },
      });
    }

    const updated = await this.prisma.payoutRequest.findUnique({ where: { id } });
    return { data: updated, msg: 'Updated' };
  }
}
