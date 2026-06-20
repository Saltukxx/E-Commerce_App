import { Global, Module } from '@nestjs/common';
import { StorefrontRevalidateService } from './storefront-revalidate.service';

@Global()
@Module({
  providers: [StorefrontRevalidateService],
  exports: [StorefrontRevalidateService],
})
export class CommonModule {}
