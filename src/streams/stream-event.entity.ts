import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type StreamEventType =
  | 'CREATED'
  | 'WITHDRAW'
  | 'TOP_UP'
  | 'TRANSFER'
  | 'PAUSED'
  | 'RESUMED'
  | 'CANCEL'
  | 'COMPLETE';

@Entity('stream_events')
export class StreamEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  @Index()
  stream_id: string;

  @Column()
  @Index()
  event_type: StreamEventType;

  @Column({ default: '' })
  actor: string;

  @Column('bigint', { default: '0' })
  amount: string;

  @Column({ nullable: true })
  tx_hash: string;

  @Column({ type: 'int', default: 0 })
  ledger: number;

  @CreateDateColumn()
  created_at: Date;
}
