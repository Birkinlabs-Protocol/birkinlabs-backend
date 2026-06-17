import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type StreamStatus = 'Active' | 'Paused' | 'Cancelled' | 'Completed';

@Entity('streams')
export class Stream {
  @PrimaryColumn('bigint')
  stream_id: string;

  @Column()
  sender: string;

  @Column()
  recipient: string;

  @Column()
  token: string;

  @Column('bigint')
  deposit: string;

  @Column('bigint')
  rate_per_second: string;

  @Column('bigint')
  start_time: string;

  @Column('bigint')
  stop_time: string;

  @Column('bigint', { default: '0' })
  withdrawn: string;

  @Column({ default: 'Active' })
  status: StreamStatus;

  @Column({ nullable: true })
  last_tx_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
