import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import * as crypto from 'crypto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhooks: WebhookService) {}

  @Post('stellar')
  async stellarEvent(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature: string,
  ) {
    const secret = process.env.WEBHOOK_SECRET ?? '';
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (signature !== expected) throw new UnauthorizedException('Invalid signature');

    return this.webhooks.handleStellarEvent(payload);
  }
}
