import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddWishlistDto } from './dto/add-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '../auth/guards/user-id-match.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlist: WishlistService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  get(@Param('userId', ParseIntPipe) userId: number) {
    return this.wishlist.getWishlist(userId);
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  add(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddWishlistDto,
  ) {
    return this.wishlist.add(userId, dto.productId);
  }

  @Delete(':userId/:productId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.wishlist.remove(userId, productId);
  }
}
