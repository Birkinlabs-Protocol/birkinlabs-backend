# Contributing to lumenflow-backend

This repo contains the NestJS backend for LumenFlow — the Soroban event indexer and REST API that powers the frontend.

---

## Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14+

---

## Development workflow

```bash
# Clone
git clone https://github.com/lumenflow-protocol/lumenflow-backend.git
cd lumenflow-backend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and STREAM_CONTRACT_ID

# Start in development mode (auto-reload on save)
pnpm start:dev

# Run tests
pnpm test

# Check that the build passes before opening a PR
pnpm build
```

---

## Where things live

```
src/
├── streams/          — entity, service, controller, module
├── indexer/          — Soroban RPC polling + event parsing
├── stellar/          — RPC utility service
└── monitoring/       — health check endpoint
```

**Rule of thumb:**
- Business logic goes in `*.service.ts`
- HTTP routing goes in `*.controller.ts`
- Each feature is a self-contained NestJS module

---

## Adding a new feature

1. Create a new module folder under `src/`
2. Add your entity (TypeORM), service, controller, and module file
3. Import the module in `app.module.ts`
4. Write at least one test in `*.service.spec.ts`
5. Run `pnpm build` — must pass with zero errors before opening a PR

---

## Branch naming

```
feat/stream-history-endpoint
fix/indexer-missed-events
docs/api-reference
test/streams-service-unit
```

---

## Commit format

```
feat: add stream history endpoint
fix: handle indexer startup when contract ID is missing
test: add StreamsService unit tests
chore: upgrade @stellar/stellar-sdk to v13
```

---

## Opening a PR

- Target branch: `main`
- `pnpm build` must pass
- Include a description of what changed and any relevant env variable changes

---

For questions, open a GitHub Issue or Discussion.
