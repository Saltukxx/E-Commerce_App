import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '../auth/guards/user-id-match.guard';

@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}

  @Get(':userId/summary')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  summary(@Param('userId', ParseIntPipe) userId: number) {
    return this.cart.summary(userId);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  get(@Param('userId', ParseIntPipe) userId: number) {
    return this.cart.getCart(userId);
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  add(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddCartDto,
  ) {
    return this.cart.add(userId, dto);
  }

  @Put(':userId/:cartItemId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() dto: AddCartDto,
  ) {
    return this.cart.updateQuantity(userId, cartItemId, dto);
  }

  @Delete(':userId/:cartItemId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  delete(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
  ) {
    return this.cart.deleteLine(userId, cartItemId);
  }
}
