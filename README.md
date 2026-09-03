# lumenflow-backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://postgresql.org/)

> NestJS backend for LumenFlow — indexes Soroban contract events, logs immutable contributor payout audit trails, and exposes high-performance REST APIs for maintainers and contributors.

---

## What it does

1. **Indexes Streams & Contributor Events** — polls the Soroban RPC every 5 seconds for contract events (`CREATED`, `WITHDRAW`, `TOP_UP`, `TRANSFER`, `CANCEL`, `PAUSED`, `RESUMED`, `COMPLETE`) and records both current stream state and an immutable event history table in PostgreSQL.
2. **Audit Trail for Open Source Payouts** — every withdrawal, top-up, and status change is stored with on-chain ledger sequence and transaction hash.
3. **Serves Maintainer & Contributor Metrics** — REST API endpoints for portfolio stats, claimable balances, and protocol TVL.

---

## Project structure

```
src/
├── streams/
│   ├── stream.entity.ts          — TypeORM entity (streams table with title, cliff_time, token)
│   ├── stream-event.entity.ts    — TypeORM entity (immutable audit log of payouts & events)
│   ├── stream.dto.ts             — Query DTOs (pagination, filtering, stats, analytics)
│   ├── streams.service.ts        — DB queries, stats computation & event recorders
│   ├── streams.controller.ts     — REST endpoints
│   └── streams.module.ts
├── indexer/
│   ├── indexer.service.ts        — polls Soroban RPC, parses events, updates DB
│   └── indexer.module.ts
├── stellar/
│   └── stellar.service.ts        — Soroban RPC helpers
└── monitoring/
    └── health.controller.ts      — GET /health
```

---

## REST API Endpoints

Base URL: `http://localhost:3001/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/streams/:id` | Single stream by on-chain ID |
| GET | `/streams/:id/events` | Complete immutable audit trail of payouts/events for a stream |
| GET | `/streams/sender/:address` | All streams created by maintainer (supports `?status=&search=&limit=&page=`) |
| GET | `/streams/recipient/:address` | All streams received by contributor (supports `?status=&search=&limit=&page=`) |
| GET | `/streams/stats/:address` | Summary portfolio metrics (active streams, total deposited, total claimed) |
| GET | `/streams/analytics/overview` | Global protocol analytics (TVL, volume, active stream count) |
| GET | `/health` | Service health check |

---

## Getting started

```bash
pnpm install
pnpm build
pnpm start:dev
```
