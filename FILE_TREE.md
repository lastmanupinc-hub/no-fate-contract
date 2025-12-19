# Diamond Dock - Complete File Tree

```
diamond-dock/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI/CD pipeline
│
├── prisma/
│   ├── migrations/
│   │   └── 00_init.sql                     # Initial migration
│   ├── schema.prisma                       # Database schema
│   └── seed.ts                             # Seed script for demo data
│
├── scripts/
│   ├── publication-gate.ts                 # CI enforcement script
│   └── verify-audit-chain.ts               # Audit integrity verification
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── evaluate/
│   │   │   │   ├── forward/
│   │   │   │   │   └── route.ts            # POST /api/evaluate/forward
│   │   │   │   └── backward/
│   │   │   │       └── route.ts            # POST /api/evaluate/backward
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts            # Stripe webhook handler
│   │   ├── evaluations/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                # Evaluation detail page
│   │   │   └── page.tsx                    # Evaluations list page
│   │   ├── metrics/
│   │   │   └── page.tsx                    # Metrics dashboard
│   │   ├── billing/
│   │   │   └── page.tsx                    # Billing dashboard
│   │   ├── audit/
│   │   │   └── page.tsx                    # Audit log viewer
│   │   ├── admin/
│   │   │   └── page.tsx                    # Admin panel
│   │   ├── globals.css                     # Global styles
│   │   ├── layout.tsx                      # Root layout
│   │   └── page.tsx                        # Home page
│   │
│   ├── lib/
│   │   ├── gate-engine.ts                  # Deterministic evaluation engine
│   │   ├── audit-chain.ts                  # Hash-chained audit log
│   │   ├── metering.ts                     # Usage metering service
│   │   ├── billing.ts                      # Stripe integration
│   │   └── api-utils.ts                    # API utilities
│   │
│   ├── types/
│   │   ├── constants.ts                    # Terminal states, gates, reason codes
│   │   └── schemas.ts                      # Zod schemas and types
│   │
│   └── workers/
│       ├── meter-reader.ts                 # Hourly usage aggregation worker
│       └── invoice-processor.ts            # Invoice background tasks worker
│
├── tests/
│   ├── gate-engine.test.ts                 # Gate engine unit tests
│   └── audit-chain.test.ts                 # Audit chain unit tests
│
├── .env.example                            # Example environment variables
├── .gitignore                              # Git ignore rules
├── next.config.js                          # Next.js configuration
├── package.json                            # Dependencies and scripts
├── postcss.config.js                       # PostCSS configuration
├── tailwind.config.ts                      # Tailwind CSS configuration
├── tsconfig.json                           # TypeScript configuration
├── vitest.config.ts                        # Vitest test configuration
├── README.md                               # Main documentation
└── PRODUCTION_CHECKLIST.md                 # Production deployment checklist
```

## Key Files Overview

### Configuration
- **package.json**: All dependencies, scripts, and project metadata
- **tsconfig.json**: TypeScript compiler configuration
- **next.config.js**: Next.js framework configuration
- **tailwind.config.ts**: Tailwind CSS styling configuration
- **.env.example**: Template for environment variables

### Database
- **prisma/schema.prisma**: Complete database schema with all models
- **prisma/migrations/**: Database migration files
- **prisma/seed.ts**: Seed script for demo tenant and test data

### Core Logic
- **src/lib/gate-engine.ts**: 6-gate deterministic evaluation engine
- **src/lib/audit-chain.ts**: Hash-chained append-only audit logging
- **src/lib/metering.ts**: Usage metering and cost calculation
- **src/lib/billing.ts**: Stripe billing integration
- **src/lib/api-utils.ts**: API authentication and utilities

### Types & Schemas
- **src/types/constants.ts**: All constants (terminal states, gates, etc.)
- **src/types/schemas.ts**: Zod validation schemas and TypeScript types

### API Routes
- **src/app/api/evaluate/forward/route.ts**: Forward evaluation endpoint
- **src/app/api/evaluate/backward/route.ts**: Backward evaluation endpoint
- **src/app/api/webhooks/stripe/route.ts**: Stripe webhook handler

### UI Pages
- **src/app/page.tsx**: Homepage with navigation
- **src/app/evaluations/page.tsx**: List of evaluations
- **src/app/evaluations/[id]/page.tsx**: Evaluation detail view
- **src/app/metrics/page.tsx**: Metrics and analytics dashboard
- **src/app/billing/page.tsx**: Billing and usage dashboard
- **src/app/layout.tsx**: Root layout with header

### Background Workers
- **src/workers/meter-reader.ts**: Aggregates usage and reports to Stripe
- **src/workers/invoice-processor.ts**: Handles invoice-related tasks

### Testing
- **tests/gate-engine.test.ts**: Unit tests for gate engine
- **tests/audit-chain.test.ts**: Unit tests for audit chain
- **vitest.config.ts**: Vitest test runner configuration

### CI/CD
- **.github/workflows/ci.yml**: GitHub Actions workflow with publication gates

### Scripts
- **scripts/publication-gate.ts**: Enforces No Fate Contract compliance
- **scripts/verify-audit-chain.ts**: Verifies audit chain integrity

### Documentation
- **README.md**: Complete setup and usage documentation
- **PRODUCTION_CHECKLIST.md**: Pre-deployment checklist

## Total Files: ~35 code files + configuration

All files implement production-grade patterns with:
- TypeScript strict mode
- Zod schema validation
- Error handling
- Audit logging
- Metering integration
- Idempotency
- Multi-tenant isolation
