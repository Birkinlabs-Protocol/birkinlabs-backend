import { Injectable, Logger } from '@nestjs/common';
import { SorobanRpc } from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private readonly rpc: SorobanRpc.Server;

  constructor() {
    this.rpc = new SorobanRpc.Server(
      process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
    );
  }

  async getLatestLedger(): Promise<number> {
    const ledger = await this.rpc.getLatestLedger();
    return ledger.sequence;
  }

  async getHealth(): Promise<string> {
    const health = await this.rpc.getHealth();
    return health.status;
  }
}
