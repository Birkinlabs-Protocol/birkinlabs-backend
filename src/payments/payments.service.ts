import { Injectable } from '@nestjs/common';
import { StellarService } from '../stellar/stellar.service';
import { VerifyPaymentDto } from './payments.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly stellar: StellarService) {}

  async verify(dto: VerifyPaymentDto) {
    const verified = await this.stellar.verifyPayment(dto.txHash, dto.expectedXlm, dto.senderWallet);
    return { verified, txHash: dto.txHash };
  }

  async getBalance(wallet: string) {
    const balance = await this.stellar.getBalance(wallet);
    return { wallet, balanceXlm: balance };
  }
}
