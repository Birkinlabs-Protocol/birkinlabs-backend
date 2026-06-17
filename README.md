# lumenflow-backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://postgresql.org/)

> NestJS backend for LumenFlow — indexes Soroban contract events and exposes a REST API for the frontend.

---

## What it does

1. **Indexes streams** — polls the Soroban RPC every 5 seconds for contract events (`CREATED`, `WITHDRAW`, `CANCEL`, `PAUSED`, `RESUMED`) and writes them to PostgreSQL.
2. **Serves the frontend** — REST API so the dApp can query stream state without hitting the blockchain on every render.

---

## Project structure

```
src/
├── streams/
│   ├── stream.entity.ts      — TypeORM entity (streams table)
│   ├── streams.service.ts    — DB queries (findById, findBySender, findByRecipient, upsert)
│   ├── streams.controller.ts — REST endpoints
│   └── streams.module.ts
├── indexer/
│   ├── indexer.service.ts    — polls Soroban RPC, parses events, updates DB
│   └── indexer.module.ts
├── stellar/
│   └── stellar.service.ts    — Soroban RPC helpers
└── monitoring/
    └── health.controller.ts  — GET /health
```

---

## REST API

Base URL: `http://localhost:3001/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/streams/:id` | Single stream by on-chain ID |
| GET | `/streams/sender/:address` | All streams created by a Stellar address |
| GET | `/streams/recipient/:address` | All streams received by a Stellar address |
| GET | `/health` | Service health check |

### Stream response shape

```json
{
  "stream_id": "0",
  "sender": "GAKV...R4B2",
  "recipient": "GDMO...X9F1",
  "token": "CAS4...USDC",
  "deposit": "50000000000",
  "rate_per_second": "1000000",
  "start_time": "1750000000",
  "stop_time": "1754320000",
  "withdrawn": "12000000",
  "status": "Active",
  "last_tx_hash": "abc123...",
  "created_at": "2026-06-17T10:00:00.000Z",
  "updated_at": "2026-06-17T10:05:00.000Z"
}
```

> All token amounts are in stroops (1 XLM = 10,000,000 stroops).

---

## Getting started

### Prerequisites

- Node.js >= 18 + pnpm
- PostgreSQL 14+

### Setup

```bash
pnpm install
cp .env.example .env      # fill in DATABASE_URL and STREAM_CONTRACT_ID
pnpm start:dev
```

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `SOROBAN_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `STREAM_CONTRACT_ID` | Deployed stream contract address | — |
| `START_LEDGER` | Ledger to start indexing from | `0` |
| `PORT` | API server port | `3001` |
| `NODE_ENV` | Environment | `development` |

---

## Indexer behaviour

- Polls Soroban RPC every **5 seconds**
- Processes up to **100 events per poll**
- Skips polling if the previous poll is still running
- Disabled gracefully if `STREAM_CONTRACT_ID` is not set

---

## Contributing

See the root [CONTRIBUTING.md](../CONTRIBUTING.md).

## License

MIT License — Copyright (c) 2026 LumenFlow Protocol.
