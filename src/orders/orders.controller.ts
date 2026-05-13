import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto, ConfirmPaymentDto } from './orders.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.orders.create({ ...dto, buyerWallet: req.user.walletAddress });
  }

  @Get()
  findMyOrders(@Request() req: any) {
    return this.orders.findByBuyer(req.user.walletAddress);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Patch(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.orders.confirmPayment(id, dto.txHash);
  }

  @Patch(':id/dispute')
  dispute(@Param('id') id: string, @Request() req: any) {
    return this.orders.dispute(id, req.user.walletAddress);
  }
}
