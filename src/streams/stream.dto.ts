import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StreamStatus } from './stream.entity';
import { StreamEventType } from './stream-event.entity';

export class StreamQueryDto {
  @IsOptional()
  @IsString()
  status?: StreamStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}

export class StreamResponseDto {
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
  withdrawn: string;
  status: StreamStatus;
  last_tx_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

export class StreamEventDto {
  id: number;
  stream_id: string;
  event_type: StreamEventType;
  actor: string;
  amount: string;
  tx_hash: string | null;
  ledger: number;
  created_at: Date;
}

export class AddressStatsDto {
  address: string;
  sendingCount: number;
  receivingCount: number;
  activeOutgoing: number;
  activeIncoming: number;
  totalDeposited: string;
  totalClaimed: string;
}

export class GlobalAnalyticsDto {
  totalStreams: number;
  activeStreams: number;
  totalVolumeLocked: string;
  totalVolumeWithdrawn: string;
}
