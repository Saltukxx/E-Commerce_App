import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddressOrderDto } from './dto/address-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '../auth/guards/user-id-match.guard';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  place(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddressOrderDto,
  ) {
    return this.orders.placeOrder(userId, dto);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  list(@Param('userId', ParseIntPipe) userId: number) {
    return this.orders.listOrders(userId);
  }
}
