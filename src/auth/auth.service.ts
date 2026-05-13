import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WalletLoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async walletLogin(dto: WalletLoginDto) {
    // In production: verify the Stellar signature against the public key
    // For now we trust the wallet address as identity
    const { walletAddress } = dto;

    if (!walletAddress || !walletAddress.startsWith('G')) {
      throw new UnauthorizedException('Invalid Stellar wallet address');
    }

    const payload = { sub: walletAddress, walletAddress };
    return {
      access_token: this.jwt.sign(payload),
      wallet: walletAddress,
    };
  }
}
