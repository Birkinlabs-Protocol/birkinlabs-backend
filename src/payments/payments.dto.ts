import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class VerifyPaymentDto {
  @IsString() @IsNotEmpty() txHash: string;
  @IsString() @IsNotEmpty() senderWallet: string;
  @IsNumber() expectedXlm: number;
}
