import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsAdminService } from '../products/products-admin.service';
import { slugify } from '../common/marketplace';

export type ImportPreviewRow = {
  row: number;
  title: string;
  category: string;
  priceCents: number;
  status: string;
  errors: string[];
  warnings: string[];
};

@Injectable()
export class VendorProductImportService {
  constructor(
    private prisma: PrismaService,
    private products: ProductsAdminService,
  ) {}

  getTemplateCsv(): string {
    return [
      'title,description,category,price_eur,stockQty,status,slug',
      'Beispiel Produkt,Beschreibung hier,Kompressoren,19.99,10,active,beispiel-produkt',
    ].join('\n');
  }

  parseFile(buffer: Buffer, filename: string): Record<string, string>[] {
    if (filename.endsWith('.csv')) {
      const text = buffer.toString('utf-8');
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return [];
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      return lines.slice(1).map((line) => {
        const cols = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = (cols[i] ?? '').trim();
        });
        return row;
      });
    }
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
    return rows.map((r) => {
      const normalized: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        normalized[k.trim().toLowerCase()] = String(v ?? '').trim();
      }
      return normalized;
    });
  }

  async preview(storeId: number, buffer: Buffer, filename: string) {
    const rows = this.parseFile(buffer, filename);
    const categories = await this.prisma.category.findMany();
    const catBySlug = new Map(categories.map((c) => [c.slug.toLowerCase(), c]));
    const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

    const preview: ImportPreviewRow[] = rows.map((row, idx) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const title = row.title || row.artikel || row.name || '';
      const categoryRaw = row.category || row.kategorie || '';
      const priceRaw = row.price_eur || row.price || row.preis || '0';
      const priceNum = parseFloat(priceRaw.replace(',', '.'));
      const priceCents = Number.isFinite(priceNum) ? Math.round(priceNum * 100) : -1;

      if (!title) errors.push('title missing');
      if (!categoryRaw) errors.push('category missing');
      else if (!catBySlug.has(categoryRaw.toLowerCase()) && !catByName.has(categoryRaw.toLowerCase())) {
        errors.push(`unknown category: ${categoryRaw}`);
      }
      if (priceCents < 0) errors.push('invalid price');

      return {
        row: idx + 2,
        title,
        category: categoryRaw,
        priceCents: Math.max(0, priceCents),
        status: row.status || 'active',
        errors,
        warnings,
      };
    });

    return {
      data: {
        total: preview.length,
        valid: preview.filter((p) => p.errors.length === 0).length,
        invalid: preview.filter((p) => p.errors.length > 0).length,
        rows: preview,
      },
      msg: 'Import preview',
    };
  }

  async execute(
    storeId: number,
    buffer: Buffer,
    filename: string,
    mode: 'upsert' | 'create_only' = 'upsert',
  ) {
    const preview = await this.preview(storeId, buffer, filename);
    const categories = await this.prisma.category.findMany();
    const catBySlug = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));
    const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

    let created = 0;
    let updated = 0;
    let skipped = 0;

    const rows = this.parseFile(buffer, filename);
    for (const row of rows) {
      const title = row.title || row.artikel || row.name || '';
      const categoryRaw = (row.category || row.kategorie || '').toLowerCase();
      const categoryId = catBySlug.get(categoryRaw) ?? catByName.get(categoryRaw);
      if (!title || categoryId == null) {
        skipped++;
        continue;
      }
      const priceRaw = row.price_eur || row.price || row.preis || '0';
      const priceNum = parseFloat(priceRaw.replace(',', '.'));
      const priceCents = Number.isFinite(priceNum) ? Math.round(priceNum * 100) : 0;
      const slugInput = row.slug || slugify(title);
      const description = row.description || row.beschreibung || title;
      const stockRaw = row.stockqty || row.stock || row.bestand || '';
      const stockQty = stockRaw === '' ? null : Math.max(0, parseInt(stockRaw, 10) || 0);
      const status = row.status || 'active';

      const existing = await this.prisma.product.findFirst({
        where: { storeId, slug: slugInput },
      });

      if (existing && mode === 'create_only') {
        skipped++;
        continue;
      }

      if (existing && mode === 'upsert') {
        await this.products.update(existing.id, {
          title,
          description,
          price: priceCents,
          stockQty,
          categoryId,
          status,
        }, storeId);
        updated++;
      } else {
        await this.products.create({
          title,
          slug: slugInput,
          description,
          price: priceCents,
          stockQty,
          categoryId,
          storeId,
          status,
          images: [],
        });
        created++;
      }
    }

    return {
      data: { created, updated, skipped },
      msg: 'Import complete',
    };
  }
}
