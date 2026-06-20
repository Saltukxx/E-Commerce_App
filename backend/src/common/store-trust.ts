import { Store } from '@prisma/client';

export type StoreTrustStats = {
  paymentsReady: boolean;
  avgResponseHours: number | null;
  responseTimeLabel: string | null;
};

export function mapStoreTrustFields(s: Store): StoreTrustStats {
  return {
    paymentsReady: s.stripeOnboardingComplete && s.payoutsEnabled,
    avgResponseHours: null,
    responseTimeLabel: null,
  };
}

export function computeResponseTimeLabel(medianHours: number): string | null {
  if (medianHours <= 24) return 'Antwortet in ~24 Std.';
  if (medianHours <= 48) return 'Antwortet in ~48 Std.';
  return null;
}

export async function computeStoreResponseStats(
  prisma: {
    priceInquiry: {
      findMany: (args: {
        where: {
          storeId: number;
          status: string;
          quotedAt: { not: null };
          createdAt: { gte: Date };
        };
        select: { createdAt: true; quotedAt: true };
      }) => Promise<Array<{ createdAt: Date; quotedAt: Date | null }>>;
    };
  },
  storeId: number,
): Promise<Pick<StoreTrustStats, 'avgResponseHours' | 'responseTimeLabel'>> {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const quoted = await prisma.priceInquiry.findMany({
    where: {
      storeId,
      status: 'quoted',
      quotedAt: { not: null },
      createdAt: { gte: since },
    },
    select: { createdAt: true, quotedAt: true },
  });

  if (quoted.length < 3) {
    return { avgResponseHours: null, responseTimeLabel: null };
  }

  const hours = quoted
    .map((row) => (row.quotedAt!.getTime() - row.createdAt.getTime()) / 3_600_000)
    .sort((a, b) => a - b);
  const median = hours[Math.floor(hours.length / 2)] ?? null;
  if (median == null) {
    return { avgResponseHours: null, responseTimeLabel: null };
  }

  return {
    avgResponseHours: median,
    responseTimeLabel: computeResponseTimeLabel(median),
  };
}
