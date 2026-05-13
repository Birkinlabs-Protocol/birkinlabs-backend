import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async handleStellarEvent(payload: any) {
    this.logger.log(`Received Stellar event: ${payload.type}`);
    // Dispatch to internal handlers based on event type
    return { received: true };
  }

  async dispatch(url: string, event: string, data: any) {
    try {
      await axios.post(url, { event, data }, { timeout: 5000 });
      this.logger.log(`Webhook dispatched: ${event} → ${url}`);
    } catch (err) {
      this.logger.error(`Webhook failed: ${event} → ${url}`, err.message);
    }
  }
}
