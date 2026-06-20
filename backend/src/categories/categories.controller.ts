import { Controller, Get, Header } from '@nestjs/common';

import { CategoriesService } from './categories.service';



@Controller('categories')

export class CategoriesController {

  constructor(private categories: CategoriesService) {}



  @Get()

  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')

  findAll() {

    return this.categories.findAll();

  }

}

