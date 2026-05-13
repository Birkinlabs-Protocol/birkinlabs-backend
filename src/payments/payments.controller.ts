import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verify(@Body() dto: VerifyPaymentDto) {
    return this.payments.verify(dto);
  }

  @Get('balance/:wallet')
  getBalance(@Param('wallet') wallet: string) {
    return this.payments.getBalance(wallet);
  }
}
