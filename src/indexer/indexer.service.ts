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
      const ledger = event.ledger;

      switch (eventName) {
        case 'CREATED': {
          const raw = scValToNative(event.value) as any[];
          const sender = String(raw[0]);
          const recipient = String(raw[1]);
          const token = String(raw[2] ?? '');
          const deposit = String(raw[3] ?? 0);
          const ratePerSecond = String(raw[4] ?? 0);
          const startTime = String(raw[5] ?? 0);
          const stopTime = String(raw[6] ?? 0);
          const cliffTime = String(raw[7] ?? 0);
          const title = String(raw[8] ?? '');

          await this.streamsService.upsert({
            stream_id: streamId,
            sender,
            recipient,
            token,
            title,
            deposit,
            rate_per_second: ratePerSecond,
            start_time: startTime,
            stop_time: stopTime,
            cliff_time: cliffTime,
            tx_hash: txHash,
            ledger,
          });
          this.logger.log(`Stream ${streamId} created (title: "${title}")`);
          break;
        }

        case 'WITHDRAW': {
          const [recipient, amount] = scValToNative(event.value) as [string, bigint];
          await this.streamsService.recordWithdrawal(
            streamId,
            String(recipient),
            String(amount),
            txHash,
            ledger,
          );
          this.logger.log(`Stream ${streamId} withdrawal: ${amount} by ${recipient}`);
          break;
        }

        case 'TOP_UP': {
          const [sender, addedAmount, newStopTime] = scValToNative(event.value) as [
            string,
            bigint,
            bigint,
          ];
          await this.streamsService.recordTopUp(
            streamId,
            String(sender),
            String(addedAmount),
            String(newStopTime),
            txHash,
            ledger,
          );
          this.logger.log(`Stream ${streamId} topped up by ${addedAmount} by ${sender}`);
          break;
        }

        case 'TRANSFER': {
          const [oldRecipient, newRecipient] = scValToNative(event.value) as [string, string];
          await this.streamsService.recordRecipientTransfer(
            streamId,
            String(oldRecipient),
            String(newRecipient),
            txHash,
            ledger,
          );
          this.logger.log(
            `Stream ${streamId} recipient transferred from ${oldRecipient} to ${newRecipient}`,
          );
          break;
        }

        case 'CANCEL': {
          await this.streamsService.updateStatus(
            streamId,
            'Cancelled',
            'CANCEL',
            '',
            txHash,
            ledger,
          );
          this.logger.log(`Stream ${streamId} cancelled`);
          break;
        }

        case 'PAUSED': {
          await this.streamsService.updateStatus(
            streamId,
            'Paused',
            'PAUSED',
            '',
            txHash,
            ledger,
          );
          this.logger.log(`Stream ${streamId} paused`);
          break;
        }

        case 'RESUMED': {
          await this.streamsService.updateStatus(
            streamId,
            'Active',
            'RESUMED',
            '',
            txHash,
            ledger,
          );
          this.logger.log(`Stream ${streamId} resumed`);
          break;
        }

        case 'COMPLETE': {
          await this.streamsService.updateStatus(
            streamId,
            'Completed',
            'COMPLETE',
            '',
            txHash,
            ledger,
          );
          this.logger.log(`Stream ${streamId} completed`);
          break;
        }

        default:
          break;
      }
    } catch (err) {
      this.logger.error(`Failed to handle event: ${err?.message}`);
    }
  }
}
