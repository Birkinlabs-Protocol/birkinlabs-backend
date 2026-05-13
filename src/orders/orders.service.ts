import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './orders.dto';
import { StellarService } from '../stellar/stellar.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    private readonly stellar: StellarService,
  ) {}

  async create(dto: CreateOrderDto & { buyerWallet: string }) {
    const totalXlm = dto.items.reduce((sum, i) => sum + i.priceXlm * i.quantity, 0);
    const order = this.repo.create({ ...dto, totalXlm, status: OrderStatus.PENDING });
    return this.repo.save(order);
  }

  async findOne(id: string) {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByBuyer(walletAddress: string) {
    return this.repo.find({
      where: { buyerWallet: walletAddress },
      order: { createdAt: 'DESC' },
    });
  }

  async confirmPayment(orderId: string, txHash: string) {
    const order = await this.findOne(orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending payment');
    }

    const verified = await this.stellar.verifyPayment(txHash, order.totalXlm, order.buyerWallet);
    if (!verified) throw new BadRequestException('Payment could not be verified on Stellar');

    order.stellarTxHash = txHash;
    order.status = OrderStatus.PAID;
    return this.repo.save(order);
  }

  async dispute(orderId: string, buyerWallet: string) {
    const order = await this.findOne(orderId);
    if (order.buyerWallet !== buyerWallet) throw new BadRequestException('Not your order');
    if (order.status !== OrderStatus.SHIPPED) throw new BadRequestException('Order must be shipped to dispute');

    order.status = OrderStatus.DISPUTED;
    return this.repo.save(order);
  }
}
