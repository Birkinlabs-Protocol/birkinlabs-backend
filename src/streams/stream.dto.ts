import { IsString, IsOptional } from 'class-validator';
import { StreamStatus } from './stream.entity';

export class StreamResponseDto {
  stream_id: string;
  sender: string;
  recipient: string;
  token: string;
  deposit: string;
  rate_per_second: string;
  start_time: string;
  stop_time: string;
  withdrawn: string;
  status: StreamStatus;
  last_tx_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

export class StreamListDto {
  streams: StreamResponseDto[];
  total: number;
}
