import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SorobanRpc, scValToNative } from '@stellar/stellar-sdk';
import { StreamsService } from '../streams/streams.service';

@Injectable()
export class IndexerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IndexerService.name);
  private readonly rpc: SorobanRpc.Server;
  private readonly contractId = process.env.STREAM_CONTRACT_ID ?? '';
  private lastLedger: number = Number(process.env.START_LEDGER ?? 0);
  private polling = false;

  constructor(private readonly streamsService: StreamsService) {
    this.rpc = new SorobanRpc.Server(
      process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
    );
  }

  onApplicationBootstrap() {
    if (!this.contractId) {
      this.logger.warn('STREAM_CONTRACT_ID not set — indexer is disabled');
      return;
    }
    this.logger.log(`Indexer started. Watching contract ${this.contractId}`);
    setInterval(() => this.poll(), 5_000);
  }

  private async poll() {
    if (this.polling) return;
    this.polling = true;
    try {
      const response = await this.rpc.getEvents({
        startLedger: this.lastLedger || undefined,
        filters: [{ type: 'contract', contractIds: [this.contractId] }],
        limit: 100,
      });

      for (const event of response.events) {
        await this.handleEvent(event);
      }

      if (response.events.length > 0) {
        this.lastLedger = response.latestLedger;
      }
    } catch (err) {
      this.logger.error('Poll error', err?.message);
    } finally {
      this.polling = false;
    }
  }

  private async handleEvent(event: SorobanRpc.Api.EventResponse) {
    try {
      const eventName = scValToNative(event.topic[0]) as string;
      const streamId = String(scValToNative(event.topic[1]) as bigint);
      const txHash = event.txHash;

      switch (eventName) {
        case 'CREATED': {
          const [sender, recipient, deposit, ratePerSecond, startTime, stopTime] =
            scValToNative(event.value) as [string, string, bigint, bigint, bigint, bigint];

          await this.streamsService.upsert({
            stream_id: streamId,
            sender,
            recipient,
            token: '',
            deposit: String(deposit),
            rate_per_second: String(ratePerSecond),
            start_time: String(startTime),
            stop_time: String(stopTime),
            tx_hash: txHash,
          });
          this.logger.log(`Stream ${streamId} created`);
          break;
        }

        case 'WITHDRAW': {
          const [, amount] = scValToNative(event.value) as [string, bigint];
          await this.streamsService.recordWithdrawal(streamId, String(amount), txHash);
          this.logger.log(`Stream ${streamId} withdrawal: ${amount}`);
          break;
        }

        case 'CANCEL': {
          await this.streamsService.updateStatus(streamId, 'Cancelled', txHash);
          this.logger.log(`Stream ${streamId} cancelled`);
          break;
        }

        case 'PAUSED': {
          await this.streamsService.updateStatus(streamId, 'Paused', txHash);
          this.logger.log(`Stream ${streamId} paused`);
          break;
        }

        case 'RESUMED': {
          await this.streamsService.updateStatus(streamId, 'Active', txHash);
          this.logger.log(`Stream ${streamId} resumed`);
          break;
        }

        default:
          break;
      }
    } catch (err) {
      this.logger.error(`Failed to handle event`, err?.message);
    }
  }
}
