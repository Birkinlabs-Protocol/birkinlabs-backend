import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyerWallet: string;

  @Column({ nullable: true })
  sellerWallet: string;

  @Column('jsonb')
  items: { productId: string; name: string; quantity: number; priceXlm: number }[];

  @Column('decimal', { precision: 18, scale: 7 })
  totalXlm: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  stellarTxHash: string;

  @Column({ nullable: true })
  escrowContractId: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
