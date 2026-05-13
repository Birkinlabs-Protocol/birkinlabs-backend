import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StellarModule } from '../stellar/stellar.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [StellarModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
