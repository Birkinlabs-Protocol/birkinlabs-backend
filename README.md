# 🔧 Birkinlabs Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The off-chain engine powering Birkinlabs order management and Stellar payment verification.**

Birkinlabs Backend is the Node.js API service that bridges on-chain Stellar payments with real-world e-commerce logic — handling orders, inventory, product catalog management, and payment webhooks.

---

## ✨ Core Features

- 🔐 **JWT Authentication**: Wallet-signed auth for buyers and sellers.
- 📦 **Order Management**: Full order lifecycle — created, paid, shipped, completed.
- 🗂️ **Product Catalog API**: CRUD for products, categories, and inventory.
- 🌐 **Stellar Payment Verification**: Validates on-chain payment transactions via Horizon.
- 🔔 **Webhook Engine**: Real-time order status events with retry logic.
- 📊 **Health & Metrics**: Prometheus metrics and readiness probes.

---

## 🗂️ Project Structure

```
src/
├── auth/               # JWT auth — wallet-signed login, guard, strategy
├── orders/             # Order lifecycle — create, pay, ship, complete
├── products/           # Product catalog — CRUD, categories, inventory
├── stellar/            # Stellar/Horizon helpers — tx verification, balance checks
├── webhook/            # Webhook dispatch with retry logic
├── monitoring/         # Health checks and Prometheus metrics
└── index.js            # App entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL database
- Stellar Horizon endpoint

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

```env
JWT_SECRET=your-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/birkinlabs
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=TESTNET
```

### Running

```bash
npm run dev
```

---

## 📖 API Modules

### Auth (`/auth`)
- `POST /auth/login` — Wallet-signed login, returns JWT.

### Orders (`/orders`)
- `POST /orders` — Create a new order.
- `GET /orders/:id` — Fetch order status and items.
- `PATCH /orders/:id/pay` — Verify and confirm Stellar payment.

### Products (`/products`)
- `GET /products` — List products with filters and pagination.
- `POST /products` — Create a product listing.

### Monitoring
- `GET /health` — Liveness probe.
- `GET /metrics` — Prometheus metrics.

---

## 🗺️ Roadmap

- [ ] **Seller Verification**: KYC-lite for marketplace sellers.
- [ ] **Escrow Integration**: Milestone-based payment release for high-value orders.
- [ ] **Analytics API**: Sales and revenue dashboards.

---

## 📜 License

MIT License. Copyright (c) 2026 Birkinlabs Protocol.
