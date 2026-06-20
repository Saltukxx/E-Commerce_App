import { BadRequestException, Controller, Get, Header, Param, Query } from '@nestjs/common';

import { StoresService } from './stores.service';



function parseOptionalInt(value: string | undefined): number | undefined {

  if (value === undefined || value === '') return undefined;

  const n = parseInt(value, 10);

  if (Number.isNaN(n)) {

    throw new BadRequestException('Invalid integer query parameter');

  }

  return n;

}



@Controller('stores')

export class StoresController {

  constructor(private storesService: StoresService) {}



  @Get('summary')

  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')

  listSummary() {

    return this.storesService.listActiveSummary();

  }



  @Get()

  list() {

    return this.storesService.listActive();

  }



  @Get(':slug/products')

  products(

    @Param('slug') slug: string,

    @Query('categoryId') categoryId?: string,

    @Query('limit') limit?: string,

    @Query('skip') skip?: string,

    @Query('q') q?: string,

  ) {

    return this.storesService.listProducts(

      slug,

      parseOptionalInt(categoryId),

      parseOptionalInt(limit),

      parseOptionalInt(skip),

      q,

    );

  }



  @Get(':slug')

  get(@Param('slug') slug: string) {

    return this.storesService.findBySlug(slug);

  }

}


