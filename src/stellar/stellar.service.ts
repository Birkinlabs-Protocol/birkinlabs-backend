import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private readonly horizonUrl = process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

  async verifyPayment(txHash: string, expectedXlm: number, senderWallet: string): Promise<boolean> {
    try {
      const { data } = await axios.get(`${this.horizonUrl}/transactions/${txHash}`);

      if (data.successful !== true) return false;
      if (data.source_account !== senderWallet) return false;

      const ops = await axios.get(`${this.horizonUrl}/transactions/${txHash}/operations`);
      const payment = ops.data._embedded?.records?.find(
        (op: any) => op.type === 'payment' && op.asset_type === 'native',
      );

      if (!payment) return false;

      const actualXlm = parseFloat(payment.amount);
      return actualXlm >= expectedXlm;
    } catch (err) {
      this.logger.error(`Payment verification failed for tx ${txHash}`, err);
      return false;
    }
  }

  async getBalance(walletAddress: string): Promise<number> {
    const { data } = await axios.get(`${this.horizonUrl}/accounts/${walletAddress}`);
    const xlmBalance = data.balances?.find((b: any) => b.asset_type === 'native');
    return parseFloat(xlmBalance?.balance ?? '0');
  }

  async getAccountInfo(walletAddress: string) {
    const { data } = await axios.get(`${this.horizonUrl}/accounts/${walletAddress}`);
    return {
      id: data.id,
      sequence: data.sequence,
      balances: data.balances,
    };
  }
}
