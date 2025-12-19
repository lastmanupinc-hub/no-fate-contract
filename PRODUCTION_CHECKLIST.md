# Production Checklist

## Pre-Deployment

### Database

- [ ] Set up production PostgreSQL instance
- [ ] Configure connection pooling (PgBouncer recommended)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Set up daily backups
- [ ] Configure database user with minimal privileges
- [ ] Revoke UPDATE/DELETE on `audit_events` table
- [ ] Set up read replicas (optional)

### Redis

- [ ] Set up production Redis instance
- [ ] Configure persistence (AOF + RDB)
- [ ] Set up Redis Sentinel or Cluster (for HA)
- [ ] Configure maxmemory policy
- [ ] Enable TLS encryption

### Stripe

- [ ] Create production Stripe account
- [ ] Create metered price in Stripe Dashboard
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Store `STRIPE_SECRET_KEY` in secrets manager
- [ ] Store `STRIPE_WEBHOOK_SECRET` in secrets manager
- [ ] Store `STRIPE_METERED_PRICE_ID` in environment
- [ ] Set `BILLING_MODE=production`
- [ ] Test payment flow in test mode first
- [ ] Configure tax rates (if applicable)

### Authentication

- [ ] Set up production Clerk application
- [ ] Configure allowed redirect URLs
- [ ] Store `CLERK_SECRET_KEY` in secrets manager
- [ ] Configure user roles and permissions
- [ ] Set up SSO (optional)

### Environment Variables

- [ ] Audit all environment variables in `.env.example`
- [ ] Store secrets in secrets manager (AWS Secrets Manager, Vault, etc.)
- [ ] Never commit secrets to version control
- [ ] Rotate `API_SECRET_SALT` regularly
- [ ] Set `NODE_ENV=production`

### Security

- [ ] Enable HTTPS only
- [ ] Configure CORS policies
- [ ] Implement rate limiting per tenant
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure security headers (Helmet.js)
- [ ] Enable audit logging for all admin actions
- [ ] Set up intrusion detection
- [ ] Configure DDoS protection

### Monitoring

- [ ] Set up OpenTelemetry exporter
- [ ] Configure log aggregation (ELK, Splunk, Datadog)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure alerting for:
  - API error rate > 1%
  - P95 latency > 1000ms
  - Database connection pool exhaustion
  - Redis connection failures
  - Stripe webhook failures
  - Audit chain integrity failures
- [ ] Set up dashboards for:
  - Terminal state distribution
  - Gate failure rates
  - Billing revenue
  - System health

### Performance

- [ ] Enable Next.js production optimizations
- [ ] Configure CDN for static assets
- [ ] Set up database query optimization
- [ ] Configure Redis caching strategies
- [ ] Enable response compression (gzip/brotli)
- [ ] Optimize Docker image size
- [ ] Configure horizontal scaling (load balancer)

### Testing

- [ ] Run full test suite: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run publication gate checks: `npm run publication-gate`
- [ ] Verify audit chain: `npm run audit:verify`
- [ ] Load test evaluation endpoints
- [ ] Test Stripe webhook delivery
- [ ] Test billing suspension/reactivation flow
- [ ] Test idempotency with replay attacks

### Documentation

- [ ] Document API endpoints (OpenAPI/Swagger)
- [ ] Create runbooks for common operations
- [ ] Document incident response procedures
- [ ] Create disaster recovery plan
- [ ] Document backup/restore procedures
- [ ] Create tenant onboarding guide

### Compliance

- [ ] GDPR compliance review (if applicable)
- [ ] SOC 2 compliance (if applicable)
- [ ] PCI DSS compliance review (Stripe handles card data)
- [ ] Data retention policies configured
- [ ] Privacy policy published
- [ ] Terms of service published

### Workers

- [ ] Deploy meter reader worker: `npm run worker:meter`
- [ ] Deploy invoice processor worker: `npm run worker:invoice`
- [ ] Configure worker monitoring and restart policies
- [ ] Set up worker log aggregation
- [ ] Configure worker failure alerting

### CI/CD

- [ ] Configure production deployment pipeline
- [ ] Set up staging environment
- [ ] Configure blue-green or canary deployments
- [ ] Set up rollback procedures
- [ ] Configure deployment notifications
- [ ] Set up automated publication gate checks in CI

## Post-Deployment

### Immediate

- [ ] Verify application is accessible
- [ ] Test API endpoints with real API key
- [ ] Verify database connectivity
- [ ] Verify Redis connectivity
- [ ] Test Stripe webhook delivery
- [ ] Verify audit chain integrity
- [ ] Test authentication flow
- [ ] Monitor error logs for 1 hour

### First 24 Hours

- [ ] Monitor evaluation success rate
- [ ] Monitor billing calculations
- [ ] Verify usage is being reported to Stripe
- [ ] Check for any security alerts
- [ ] Verify backups are running
- [ ] Monitor system resource usage
- [ ] Review application logs for warnings

### First Week

- [ ] Review all metrics dashboards
- [ ] Verify first invoices are generated correctly
- [ ] Test payment collection flow
- [ ] Review audit chain for any anomalies
- [ ] Optimize slow queries (if any)
- [ ] Review and tune rate limits
- [ ] Collect user feedback

### Ongoing

- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly disaster recovery drills
- [ ] Regular audit chain verification
- [ ] Regular backup restoration tests
- [ ] Performance optimization reviews
- [ ] Security audit reviews

## Billing-Specific Checks

- [ ] Verify pricing configuration matches business model
- [ ] Test grace period enforcement
- [ ] Test service suspension on payment failure
- [ ] Test service reactivation on payment success
- [ ] Verify usage ledger immutability
- [ ] Test meter reader idempotency
- [ ] Verify Stripe usage record deduplication
- [ ] Test invoice webhook handling
- [ ] Configure billing portal for customers
- [ ] Set up dunning emails (via Stripe)

## No Fate Contract Enforcement

- [ ] Verify only 4 terminal states exist in codebase
- [ ] Confirm no suggestion text in UI
- [ ] Verify audit log has no UPDATE/DELETE permissions
- [ ] Confirm gate engine is deterministic (no random/probabilistic logic)
- [ ] Verify no auto-repair or "helpful" modifications
- [ ] Confirm rejection is first-class (no hidden success paths)
- [ ] Verify publication gate checks pass in CI

## Disaster Recovery

- [ ] Document RTO (Recovery Time Objective): __________
- [ ] Document RPO (Recovery Point Objective): __________
- [ ] Test database restoration procedure
- [ ] Test Redis restoration procedure
- [ ] Test application redeployment
- [ ] Document emergency contacts
- [ ] Set up incident communication channels
- [ ] Create status page

## Sign-Off

- [ ] Engineering Lead: ________________ Date: __________
- [ ] Security Review: _________________ Date: __________
- [ ] Operations: ______________________ Date: __________
- [ ] Product: _________________________ Date: __________

---

**This checklist must be completed before production deployment.**
