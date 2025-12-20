# Diamond Dock - Execution Runtime

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run db:push

# Start services
docker-compose up
```

### Production Deployment
```bash
# Build from frozen tag
git checkout v1.0.0-diamond-grid-8facets

# Set production environment variables
cp .env.docker .env
# Edit .env with production values

# Deploy
docker-compose up -d

# Run migrations
docker-compose exec core npx prisma migrate deploy
```

## Architecture

- **Diamond Docking Core** (Next.js): HTTP API, billing, audit, UI
- **Facet Runtime** (FastAPI): Executes 8 frozen facets server-side
- **PostgreSQL**: Audit chain, metering ledger, tenant data
- **Redis**: Rate limiting, caching

## Endpoints

### Facet Evaluation
```
POST /api/facet/{facet}
```

Valid facets: `ai`, `banking`, `government`, `tsa`, `defense`, `energy`, `insurance`, `spacex`

### Health Checks
```
GET /api/health          # Core health
GET /health              # Facet runtime health (port 8000)
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `FACET_RUNTIME_URL` - Facet runtime service URL
- `STRIPE_SECRET_KEY` - Stripe API key (test mode)
- `CLERK_SECRET_KEY` - Clerk authentication key

See `.env.example` for full list.

## Billing

All evaluation attempts are billable (outcome-neutral).
Billing is byte-rate metered: `(request_bytes + response_bytes) * rate`

## Audit

Every evaluation emits an immutable audit record.
Audit chain is cryptographically verified.
