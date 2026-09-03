import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream, StreamStatus } from './stream.entity';
import { StreamEvent, StreamEventType } from './stream-event.entity';
import { StreamQueryDto, AddressStatsDto, GlobalAnalyticsDto } from './stream.dto';

export interface CreateStreamData {
  stream_id: string;
  sender: string;
  recipient: string;
  token: string;
  title: string;
  deposit: string;
  rate_per_second: string;
  start_time: string;
  stop_time: string;
  cliff_time: string;
  tx_hash: string;
  ledger?: number;
}

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepo: Repository<Stream>,
    @InjectRepository(StreamEvent)
    private readonly eventRepo: Repository<StreamEvent>,
  ) {}

  async findById(streamId: string): Promise<Stream> {
    const stream = await this.streamRepo.findOne({ where: { stream_id: streamId } });
    if (!stream) throw new NotFoundException(`Stream ${streamId} not found`);
    return stream;
  }

  async findBySender(
    address: string,
    query?: StreamQueryDto,
  ): Promise<{ streams: Stream[]; total: number }> {
    const qb = this.streamRepo.createQueryBuilder('s').where('s.sender = :address', { address });

    if (query?.status) {
      qb.andWhere('s.status = :status', { status: query.status });
    }
    if (query?.search) {
      qb.andWhere('(s.title ILIKE :search OR s.recipient ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const limit = query?.limit ?? 50;
    const page = query?.page ?? 1;

    qb.orderBy('s.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [streams, total] = await qb.getManyAndCount();
    return { streams, total };
  }

  async findByRecipient(
    address: string,
    query?: StreamQueryDto,
  ): Promise<{ streams: Stream[]; total: number }> {
    const qb = this.streamRepo.createQueryBuilder('s').where('s.recipient = :address', { address });

    if (query?.status) {
      qb.andWhere('s.status = :status', { status: query.status });
    }
    if (query?.search) {
      qb.andWhere('(s.title ILIKE :search OR s.sender ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const limit = query?.limit ?? 50;
    const page = query?.page ?? 1;

    qb.orderBy('s.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [streams, total] = await qb.getManyAndCount();
    return { streams, total };
  }

  async getEvents(streamId: string): Promise<StreamEvent[]> {
    return this.eventRepo.find({
      where: { stream_id: streamId },
      order: { created_at: 'ASC' },
    });
  }

  async recordEvent(
    streamId: string,
    eventType: StreamEventType,
    actor: string,
    amount: string,
    txHash: string,
    ledger: number = 0,
  ): Promise<void> {
    await this.eventRepo.save({
      stream_id: streamId,
      event_type: eventType,
      actor,
      amount,
      tx_hash: txHash,
      ledger,
    });
  }

  async upsert(data: CreateStreamData): Promise<void> {
    await this.streamRepo.upsert(
      {
        stream_id: data.stream_id,
        sender: data.sender,
        recipient: data.recipient,
        token: data.token,
        title: data.title,
        deposit: data.deposit,
        rate_per_second: data.rate_per_second,
        start_time: data.start_time,
        stop_time: data.stop_time,
        cliff_time: data.cliff_time || '0',
        withdrawn: '0',
        status: 'Active',
        last_tx_hash: data.tx_hash,
      },
      ['stream_id'],
    );

    await this.recordEvent(
      data.stream_id,
      'CREATED',
      data.sender,
      data.deposit,
      data.tx_hash,
      data.ledger ?? 0,
    );
  }

  async updateStatus(
    streamId: string,
    status: StreamStatus,
    eventType: StreamEventType,
    actor: string,
    txHash: string,
    ledger: number = 0,
  ): Promise<void> {
    await this.streamRepo.update({ stream_id: streamId }, { status, last_tx_hash: txHash });
    await this.recordEvent(streamId, eventType, actor, '0', txHash, ledger);
  }

  async recordWithdrawal(
    streamId: string,
    recipient: string,
    amount: string,
    txHash: string,
    ledger: number = 0,
  ): Promise<void> {
    await this.streamRepo
      .createQueryBuilder()
      .update(Stream)
      .set({
        withdrawn: () => `withdrawn + ${BigInt(amount)}`,
        last_tx_hash: txHash,
      })
      .where('stream_id = :id', { id: streamId })
      .execute();

    await this.recordEvent(streamId, 'WITHDRAW', recipient, amount, txHash, ledger);
  }

  async recordTopUp(
    streamId: string,
    sender: string,
    amount: string,
    newStopTime: string,
    txHash: string,
    ledger: number = 0,
  ): Promise<void> {
    await this.streamRepo
      .createQueryBuilder()
      .update(Stream)
      .set({
        deposit: () => `deposit + ${BigInt(amount)}`,
        stop_time: newStopTime,
        last_tx_hash: txHash,
      })
      .where('stream_id = :id', { id: streamId })
      .execute();

    await this.recordEvent(streamId, 'TOP_UP', sender, amount, txHash, ledger);
  }

  async recordRecipientTransfer(
    streamId: string,
    oldRecipient: string,
    newRecipient: string,
    txHash: string,
    ledger: number = 0,
  ): Promise<void> {
    await this.streamRepo.update(
      { stream_id: streamId },
      { recipient: newRecipient, last_tx_hash: txHash },
    );

    await this.recordEvent(
      streamId,
      'TRANSFER',
      `${oldRecipient}->${newRecipient}`,
      '0',
      txHash,
      ledger,
    );
  }

  async getStatsForAddress(address: string): Promise<AddressStatsDto> {
    const sending = await this.streamRepo.find({ where: { sender: address } });
    const receiving = await this.streamRepo.find({ where: { recipient: address } });

    const totalDeposited = sending
      .reduce((acc, s) => acc + BigInt(s.deposit), 0n)
      .toString();

    const totalClaimed = receiving
      .reduce((acc, s) => acc + BigInt(s.withdrawn), 0n)
      .toString();

    const activeOutgoing = sending.filter((s) => s.status === 'Active').length;
    const activeIncoming = receiving.filter((s) => s.status === 'Active').length;

    return {
      address,
      sendingCount: sending.length,
      receivingCount: receiving.length,
      activeOutgoing,
      activeIncoming,
      totalDeposited,
      totalClaimed,
    };
  }

  async getGlobalAnalytics(): Promise<GlobalAnalyticsDto> {
    const totalStreams = await this.streamRepo.count();
    const activeStreams = await this.streamRepo.count({ where: { status: 'Active' } });

    const streams = await this.streamRepo.find();
    const totalVolumeLocked = streams
      .reduce((acc, s) => acc + BigInt(s.deposit), 0n)
      .toString();

    const totalVolumeWithdrawn = streams
      .reduce((acc, s) => acc + BigInt(s.withdrawn), 0n)
      .toString();

    return {
      totalStreams,
      activeStreams,
      totalVolumeLocked,
      totalVolumeWithdrawn,
    };
  }
}
