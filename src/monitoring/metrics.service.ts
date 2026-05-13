import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();

  readonly httpRequests = new Counter({
    name: 'birkinlabs_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status'],
    registers: [this.registry],
  });

  readonly orderCreated = new Counter({
    name: 'birkinlabs_orders_created_total',
    help: 'Total orders created',
    registers: [this.registry],
  });

  readonly paymentVerified = new Counter({
    name: 'birkinlabs_payments_verified_total',
    help: 'Total Stellar payments verified',
    labelNames: ['success'],
    registers: [this.registry],
  });

  readonly requestDuration = new Histogram({
    name: 'birkinlabs_request_duration_seconds',
    help: 'Request duration in seconds',
    labelNames: ['method', 'path'],
    registers: [this.registry],
  });
}
