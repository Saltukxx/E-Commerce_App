import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapCategory } from '../common/mappers';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    return rows.map(mapCategory);
  }
}
