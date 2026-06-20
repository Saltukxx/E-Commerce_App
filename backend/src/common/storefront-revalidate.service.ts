import { Injectable, Logger } from '@nestjs/common';

const DEFAULT_PATHS = ['/', '/katalog', '/haendler'];

@Injectable()
export class StorefrontRevalidateService {
  private readonly logger = new Logger(StorefrontRevalidateService.name);

  /** Fire-and-forget ISR revalidation on the Next.js storefront after catalog changes. */
  async revalidate(paths: string[] = DEFAULT_PATHS): Promise<void> {
    const base = process.env.STOREFRONT_URL?.trim().replace(/\/$/, '');
    const secret = process.env.REVALIDATE_SECRET?.trim();
    if (!base || !secret) return;

    try {
      const res = await fetch(`${base}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ paths }),
      });
      if (!res.ok) {
        this.logger.warn(`Storefront revalidate failed: ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`Storefront revalidate error: ${err instanceof Error ? err.message : err}`);
    }
  }
}
