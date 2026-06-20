import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  cartLineSellabilityIssue,
  computeVendorTotals,
} from './marketplace';

export type CartLineWithProduct = Awaited<
  ReturnType<typeof loadValidatedCartLines>
>['lines'][number];

export type VendorCheckoutGroup = {
  storeId: number;
  storeName: string;
  lines: CartLineWithProduct[];
  subtotalCents: number;
  totals: ReturnType<typeof computeVendorTotals>;
};

export type PreparedCheckout = {
  lines: CartLineWithProduct[];
  lineIds: number[];
  vendorGroups: VendorCheckoutGroup[];
  grandTotal: number;
};

export async function loadValidatedCartLines(
  prisma: PrismaService,
  userId: number,
) {
  const lines = await prisma.cartLine.findMany({
    where: { userId },
    include: {
      product: { include: { store: true } },
    },
    orderBy: { id: 'asc' },
  });

  if (lines.length === 0) {
    throw new BadRequestException('Cart is empty');
  }

  for (const line of lines) {
    const issue = cartLineSellabilityIssue({
      product: line.product,
      productName: line.productName,
      storeName: line.storeName,
    });
    if (issue) {
      throw new BadRequestException(issue);
    }
  }

  return { lines, lineIds: lines.map((line) => line.id) };
}

export function groupCartLines(lines: CartLineWithProduct[]): PreparedCheckout {
  const groupMap = new Map<
    number,
    {
      storeId: number;
      storeName: string;
      lines: CartLineWithProduct[];
      subtotalCents: number;
    }
  >();

  for (const line of lines) {
    let group = groupMap.get(line.storeId);
    if (!group) {
      group = {
        storeId: line.storeId,
        storeName: line.storeName,
        lines: [],
        subtotalCents: 0,
      };
      groupMap.set(line.storeId, group);
    }
    group.lines.push(line);
    group.subtotalCents += line.product.price * line.quantity;
  }

  const vendorGroups = [...groupMap.values()].map((g) => ({
    ...g,
    totals: computeVendorTotals(g.subtotalCents),
  }));
  const grandTotal = vendorGroups.reduce((s, g) => s + g.totals.total, 0);

  return {
    lines,
    lineIds: lines.map((line) => line.id),
    vendorGroups,
    grandTotal,
  };
}

export async function prepareCheckout(
  prisma: PrismaService,
  userId: number,
): Promise<PreparedCheckout> {
  const { lines, lineIds } = await loadValidatedCartLines(prisma, userId);
  const grouped = groupCartLines(lines);
  return { ...grouped, lineIds };
}

/**
 * Money units in marketplace checkout:
 * - Product.price, CartLine.price, OrderLine.price: euro **cents**
 * - Order/OrderGroup subtotal, shipping, tax, totalAmount, grandTotal: **euros**
 */
export function eurosToStripeCents(amountEur: number): number {
  return Math.round(amountEur * 100);
}
