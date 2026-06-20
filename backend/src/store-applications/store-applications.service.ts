import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreApplicationDto } from './dto/create-store-application.dto';
import {
  APPLICATION_STATUS,
  slugify,
  STORE_STATUS,
} from '../common/marketplace';
import { mapStore } from '../common/mappers';
import { buildStoreUpdateData, syncStoreFeaturedProducts } from '../common/store-profile';

@Injectable()
export class StoreApplicationsService {
  private readonly log = new Logger(StoreApplicationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreApplicationDto, applicantUserId?: number) {
    const pending = await this.prisma.storeApplication.findFirst({
      where: {
        contactEmail: dto.contactEmail,
        status: APPLICATION_STATUS.PENDING,
      },
    });
    if (pending) {
      throw new ConflictException(
        'An application with this email is already pending review',
      );
    }

    const row = await this.prisma.storeApplication.create({
      data: {
        businessName: dto.businessName,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        phone: dto.phone ?? '',
        message: dto.message ?? '',
        applicantUserId,
      },
    });
    return { data: { id: row.id }, msg: 'Application submitted' };
  }

  async listPending(status?: string) {
    const where =
      status && status !== 'all'
        ? { status }
        : status === 'all'
          ? {}
          : { status: APPLICATION_STATUS.PENDING };
    const rows = await this.prisma.storeApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { data: rows, msg: 'Store applications' };
  }

  async approve(applicationId: number, adminUserId: number) {
    const application = await this.prisma.storeApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.status === APPLICATION_STATUS.APPROVED) {
      if (application.createdStoreId != null) {
        const store = await this.prisma.store.findUnique({
          where: { id: application.createdStoreId },
        });
        return { data: store ? mapStore(store) : null, msg: 'Already approved' };
      }
    }
    if (application.status !== APPLICATION_STATUS.PENDING) {
      throw new BadRequestException('Application is not pending');
    }

    const baseSlug = slugify(application.businessName) || 'store';
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const tempPassword = `Vendor${Date.now().toString(36)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: application.contactEmail },
        include: { ownedStore: { select: { id: true } } },
      });
      let issuedTempPassword: string | undefined;
      if (existing?.ownedStore != null) {
        throw new ConflictException(
          'This email already has a vendor store on the marketplace',
        );
      }
      let ownerId: number;
      if (existing == null) {
        const created = await tx.user.create({
          data: {
            email: application.contactEmail,
            passwordHash,
            name: application.contactName,
            role: 'vendor',
          },
        });
        ownerId = created.id;
        issuedTempPassword = tempPassword;
      } else {
        const updated = await tx.user.update({
          where: { id: existing.id },
          data: { role: 'vendor' },
        });
        ownerId = updated.id;
      }

      const store = await tx.store.create({
        data: {
          name: application.businessName,
          slug,
          description: application.message,
          status: STORE_STATUS.ACTIVE,
          contactEmail: application.contactEmail,
          phone: application.phone,
          ownerUserId: ownerId,
        },
      });

      await tx.storeApplication.update({
        where: { id: applicationId },
        data: {
          status: APPLICATION_STATUS.APPROVED,
          reviewedByAdminId: adminUserId,
          reviewedAt: new Date(),
          createdStoreId: store.id,
        },
      });

      return { store, issuedTempPassword };
    });

    this.log.warn(
      `Vendor account created for ${application.contactEmail}. Temporary password was issued (not returned in API).`,
    );

    return {
      data: {
        store: mapStore(result.store),
        vendorEmail: application.contactEmail,
        ...(result.issuedTempPassword
          ? { tempPassword: result.issuedTempPassword }
          : {}),
      },
      msg: 'Application approved',
    };
  }

  async reject(
    applicationId: number,
    adminUserId: number,
    rejectionReason?: string,
  ) {
    const application = await this.prisma.storeApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.status !== APPLICATION_STATUS.PENDING) {
      throw new BadRequestException('Application is not pending');
    }
    await this.prisma.storeApplication.update({
      where: { id: applicationId },
      data: {
        status: APPLICATION_STATUS.REJECTED,
        reviewedByAdminId: adminUserId,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason ?? '',
      },
    });
    return { data: { id: applicationId }, msg: 'Application rejected' };
  }

  async updateStoreStatus(storeId: number, status: 'active' | 'suspended') {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: { status },
    });
    return { data: mapStore(updated), msg: 'Store updated' };
  }

  async listAllStores() {
    const stores = await this.prisma.store.findMany({
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
    });
    return { data: stores.map((s) => mapStore(s)), msg: 'Stores' };
  }

  async getStoreDetail(storeId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: { select: { id: true, email: true, name: true } },
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
        owner: store.owner,
        productCount: store._count.products,
        orderCount: store._count.orders,
        stripeAccountId: store.stripeAccountId,
        stripeOnboardingComplete: store.stripeOnboardingComplete,
        payoutsEnabled: store.payoutsEnabled,
        featuredProductIds: store.featuredProducts.map((fp) => fp.productId),
      },
      msg: 'Store detail',
    };
  }

  async updateStore(
    storeId: number,
    data: {
      name?: string;
      description?: string;
      logo?: string;
      banner?: string;
      contactEmail?: string;
      phone?: string;
      deliveryArea?: string;
      city?: string;
      website?: string;
      certifications?: string[];
      isFeatured?: boolean;
      featuredProductIds?: number[];
    },
  ) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (data.featuredProductIds != null) {
      await syncStoreFeaturedProducts(this.prisma, storeId, data.featuredProductIds);
    }
    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: buildStoreUpdateData(data),
    });
    return { data: mapStore(updated), msg: 'Store updated' };
  }
}
