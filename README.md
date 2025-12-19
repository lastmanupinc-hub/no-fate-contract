# Diamond Dock

**Deterministic Boundary + Metering + Billing**

Production-grade SaaS for deterministic boundary evaluation with integrated metering and billing.

```
MODE: DESIRELESS (BOUNDARY OBSERVATION ONLY)
```

## No Fate Contract (Binding)

This system classifies every evaluation into **exactly one** of four terminal outcomes:

1. `DETERMINISTIC_COMPLIANCE`
2. `DETERMINISTIC_VIOLATION`
3. `NO_DETERMINISTIC_OUTCOME`
4. `INVALID_INPUT`

**Any other state is INVALID and will fail CI.**

Rejection is first-class. Emission rejects the originating engine (no persistent authority inside the classifier).

---

## Features

- **6-Gate Deterministic Engine**: intake → temporal → authority → rules → cardinality → validity
- **Append-Only Audit Log**: Hash-chained, cryptographically verifiable
- **Metered Billing**: Bytes in/out + gates executed + audit writes
- **Stripe Integration**: Automated invoicing, usage reporting, payment collection
- **Multi-Tenant**: Row-level isolation, API keys, HMAC signing
- **Desireless UI**: No progress bars, recommendations, or "fix this" suggestions
- **Publication Gates**: CI enforces contract compliance

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Stripe account (for production billing)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd diamond-dock

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your database, Redis, Stripe credentials

# Setup database
npx prisma generate
npx prisma db push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## Architecture

### Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma)
- **Queue**: BullMQ + Redis
- **Auth**: Clerk
- **Payments**: Stripe Billing (metered)
- **Observability**: OpenTelemetry (optional)

### Directory Structure

```
diamond-dock/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/
│   │   │   ├── evaluate/
│   │   │   │   ├── forward/    # POST forward evaluation
│   │   │   │   └── backward/   # POST backward evaluation
│   │   │   └── webhooks/
│   │   │       └── stripe/     # Stripe webhooks
│   │   ├── evaluations/        # Evaluation list + detail
│   │   ├── metrics/            # Metrics dashboard
│   │   ├── billing/            # Billing dashboard
│   │   ├── audit/              # Audit log viewer
│   │   └── admin/              # Admin panel
│   ├── lib/
│   │   ├── gate-engine.ts      # Deterministic evaluation engine
│   │   ├── audit-chain.ts      # Hash-chained audit log
│   │   ├── metering.ts         # Usage metering
│   │   ├── billing.ts          # Stripe integration
│   │   └── api-utils.ts        # API utilities
│   ├── types/
│   │   ├── constants.ts        # Terminal states, gates, reason codes
│   │   └── schemas.ts          # Zod schemas
│   └── workers/
│       ├── meter-reader.ts     # Hourly usage aggregation
│       └── invoice-processor.ts # Invoice background tasks
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed script
├── scripts/
│   ├── publication-gate.ts     # CI enforcement script
│   └── verify-audit-chain.ts   # Audit integrity check
└── tests/
    ├── gate-engine.test.ts
    └── audit-chain.test.ts
```

---

## API Usage

### Authentication

All API requests require an API key:

```bash
-H "x-api-key: your_api_key"
```

### Forward Evaluation

```bash
POST /api/evaluate/forward
Content-Type: application/json
x-api-key: <your_api_key>

{
  "text": "Sample evaluation text",
  "evaluated_at": "2025-12-18T10:00:00.000Z",
  "observed_at": "2025-12-18T09:59:55.000Z",
  "decision_window_ms": 5000,
  "idempotency_key": "unique-key-123"
}
```

**Response:**

```json
{
  "state": "DETERMINISTIC_COMPLIANCE",
  "gate_trace": [...],
  "temporal_status": "FRESH",
  "staleness_ms": 5000,
  "audit_head_hash": "abc123...",
  "metering_units": {
    "bytes_in": 234,
    "bytes_out": 567,
    "gates_executed": 6,
    "audit_writes": 8,
    "wall_time_ms": 45
  }
}
```

### Backward Evaluation

```bash
POST /api/evaluate/backward
Content-Type: application/json
x-api-key: <your_api_key>

{
  "core_ir": { "data": "..." },
  "render_targets": ["json", "xml"],
  "cardinality_mode": "one",
  "evaluated_at": "2025-12-18T10:00:00.000Z",
  "idempotency_key": "unique-key-456"
}
```

---

## Billing

### Pricing Model

Usage is metered per:

- **Bytes In**: $0.10 per MB (configurable via `PRICE_PER_MB_IN`)
- **Bytes Out**: $0.15 per MB (configurable via `PRICE_PER_MB_OUT`)
- **Gates Executed**: $0.01 per gate (configurable via `PRICE_PER_GATE`)
- **Audit Events**: $0.02 per event (configurable via `PRICE_PER_AUDIT_EVENT`)

### Billing Modes

**Mock Mode** (default for development):
- Set `BILLING_MODE=mock` in `.env`
- No external Stripe calls
- Still produces audit + metering records

**Production Mode**:
- Set `BILLING_MODE=production`
- Requires valid Stripe credentials
- Reports usage to Stripe hourly
- Automated invoicing

### Service Policy

- Payment failures trigger grace period (default: 3 days)
- After grace period expires, service is suspended
- Suspended tenants receive `NO_DETERMINISTIC_OUTCOME` with `BILLING_HOLD` reason
- Payment success reactivates service immediately

---

## Workers

### Meter Reader

Aggregates usage hourly and reports to Stripe:

```bash
npm run worker:meter
```

Runs continuously, processing:
1. Aggregate metering records per tenant per hour
2. Create immutable usage ledger entries
3. Report usage to Stripe (if production mode)
4. Write audit events

### Invoice Processor

Handles invoice-related background tasks:

```bash
npm run worker:invoice
```

---

## Audit Chain

Every operation writes to an append-only, hash-chained audit log:

```
this_hash = sha256(prev_hash + canonical_json(event))
```

### Verify Integrity

```bash
npm run audit:verify
```

This script validates:
- Hash chain continuity
- No broken links
- No tampering

---

## Development

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

### Linting & Type Checking

```bash
npm run lint
npm run type-check
```

### Publication Gate

Enforce No Fate Contract compliance:

```bash
npm run publication-gate
```

This checks:
- Only 4 terminal states used
- No suggestion text in UI ("try", "should", "recommended")
- No audit log mutations (UPDATE/DELETE)
- No non-schema responses

---

## Deployment

### Environment Variables

See [.env.example](./.env.example) for all required variables.

**Critical:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `STRIPE_SECRET_KEY`: Stripe API key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `CLERK_SECRET_KEY`: Clerk authentication

### Build

```bash
npm run build
npm start
```

### Docker (optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## CI/CD

GitHub Actions workflow enforces:

1. **Publication Gate Checks**
   - No invalid terminal states
   - No suggestion text in UI
   - Audit log immutability

2. **Tests**
   - Unit tests with coverage
   - Type checking
   - Linting

3. **E2E Tests**
   - Playwright smoke tests

See [.github/workflows/ci.yml](./.github/workflows/ci.yml)

---

## Observability

### Structured Logging

All services emit JSON logs with:
- `timestamp`
- `level`
- `service`
- `tenant_id`
- `evaluation_id`
- `trace_id`

### OpenTelemetry (Optional)

Configure OTEL exporter:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=<your-endpoint>
OTEL_SERVICE_NAME=diamond-dock
```

---

## Security

- **Row-level tenant isolation** in database queries
- **API key authentication** with SHA-256 hashing
- **HMAC signing** option for request integrity
- **Rate limiting** per tenant (configurable)
- **Idempotency keys** for evaluation and usage reporting
- **Stripe webhook signature verification**
- **Secrets via environment variables** (never committed)

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (WARNING: destroys data)
npx prisma migrate reset
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli ping
```

### Stripe Webhook Testing

Use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## License

MIT

---

## Support

For issues or questions:
- GitHub Issues: <repository-url>/issues
- Documentation: <repository-url>/wiki

---

**Built under the No Fate Contract.**
**MODE: DESIRELESS (BOUNDARY OBSERVATION ONLY)**
