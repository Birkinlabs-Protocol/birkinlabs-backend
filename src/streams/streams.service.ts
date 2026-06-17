import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream, StreamStatus } from './stream.entity';

export interface CreateStreamData {
  stream_id: string;
  sender: string;
  recipient: string;
  token: string;
  deposit: string;
  rate_per_second: string;
  start_time: string;
  stop_time: string;
  tx_hash: string;
}

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(Stream)
    private readonly repo: Repository<Stream>,
  ) {}

  async findById(streamId: string): Promise<Stream> {
    const stream = await this.repo.findOne({ where: { stream_id: streamId } });
    if (!stream) throw new NotFoundException(`Stream ${streamId} not found`);
    return stream;
  }

  async findBySender(address: string): Promise<Stream[]> {
    return this.repo.find({ where: { sender: address }, order: { created_at: 'DESC' } });
  }

  async findByRecipient(address: string): Promise<Stream[]> {
    return this.repo.find({ where: { recipient: address }, order: { created_at: 'DESC' } });
  }

  async upsert(data: CreateStreamData): Promise<void> {
    await this.repo.upsert(
      {
        stream_id: data.stream_id,
        sender: data.sender,
        recipient: data.recipient,
        token: data.token,
        deposit: data.deposit,
        rate_per_second: data.rate_per_second,
        start_time: data.start_time,
        stop_time: data.stop_time,
        withdrawn: '0',
        status: 'Active',
        last_tx_hash: data.tx_hash,
      },
      ['stream_id'],
    );
  }

  async updateStatus(streamId: string, status: StreamStatus, txHash: string): Promise<void> {
    await this.repo.update({ stream_id: streamId }, { status, last_tx_hash: txHash });
  }

  async recordWithdrawal(streamId: string, amount: string, txHash: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Stream)
      .set({
        withdrawn: () => `withdrawn + ${BigInt(amount)}`,
        last_tx_hash: txHash,
      })
      .where('stream_id = :id', { id: streamId })
      .execute();
  }
}
