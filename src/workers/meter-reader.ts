import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { meteringService } from '@/lib/metering'
import { billingService } from '@/lib/billing'
import { auditChain } from '@/lib/audit-chain'
import { AUDIT_EVENT_TYPES } from '@/types/constants'
import { getConfig } from '../lib/config'

const config = getConfig()
const connection = new IORedis(config.REDIS_URL)

/**
 * Meter Reader Worker
 * Aggregates usage and reports to Stripe
 */

export const meterQueue = new Queue('meter-reading', { connection })

interface MeterJobData {
  tenant_id: string
  period_start: string
  period_end: string
}

const meterWorker = new Worker<MeterJobData>(
  'meter-reading',
  async (job) => {
    const { tenant_id, period_start, period_end } = job.data
    
    console.log(`Processing meter reading for tenant ${tenant_id}`)
    
    // Aggregate usage
    const aggregation = await meteringService.aggregateUsage(
      tenant_id,
      new Date(period_start),
      new Date(period_end)
    )
    
    console.log(`Aggregated usage: ${aggregation.total_cost_cents} cents`)
    
    // Get tenant
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenant_id },
      select: { stripeSubscriptionId: true },
    })
    
    if (!tenant?.stripeSubscriptionId) {
      console.warn(`No subscription for tenant ${tenant_id}`)
      return { skipped: true, reason: 'No subscription' }
    }
    
    // Report to Stripe (quantity = cents)
    const quantity = Number(aggregation.total_cost_cents)
    
    if (quantity === 0) {
      console.log(`No usage to report for tenant ${tenant_id}`)
      return { skipped: true, reason: 'Zero usage' }
    }
    
    const idempotencyKey = `meter_${aggregation.ledger_id}_${aggregation.usage_hash.substring(0, 16)}`
    
    const stripeUsageId = await billingService.reportUsage(
      tenant.stripeSubscriptionId,
      quantity,
      new Date(period_end),
      idempotencyKey
    )
    
    // Mark as reported
    await meteringService.markStripeReported(aggregation.ledger_id, stripeUsageId)
    
    // Write audit event
    await auditChain.writeEvent({
      event_type: AUDIT_EVENT_TYPES.STRIPE_USAGE_REPORTED,
      tenant_id,
      payload: {
        ledger_id: aggregation.ledger_id,
        stripe_usage_id: stripeUsageId,
        quantity,
        period_start,
        period_end,
      },
    })
    
    console.log(`Reported usage to Stripe: ${stripeUsageId}`)
    
    return {
      success: true,
      stripe_usage_id: stripeUsageId,
      quantity,
    }
  },
  {
    connection,
    concurrency: 5,
  }
)

meterWorker.on('completed', (job) => {
  console.log(`Meter job ${job.id} completed`)
})

meterWorker.on('failed', (job, err) => {
  console.error(`Meter job ${job?.id} failed:`, err)
})

/**
 * Schedule hourly meter reading for all tenants
 */
export async function scheduleHourlyMetering() {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  const tenants = await prisma.tenant.findMany({
    where: {
      billingStatus: 'active',
    },
  })
  
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMinutes(0, 0, 0)
  
  const periodStart = new Date(periodEnd)
  periodStart.setHours(periodStart.getHours() - 1)
  
  console.log(`Scheduling meter reading for ${tenants.length} tenants`)
  
  for (const tenant of tenants) {
    await meterQueue.add(
      'meter-reading',
      {
        tenant_id: tenant.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      },
      {
        jobId: `meter_${tenant.id}_${periodEnd.toISOString()}`,
        removeOnComplete: 100,
        removeOnFail: 1000,
      }
    )
  }
  
  console.log('Meter reading jobs scheduled')
}

// Run worker if executed directly
if (require.main === module) {
  console.log('Meter reader worker started')
  
  // Schedule hourly metering
  setInterval(() => {
    scheduleHourlyMetering().catch(console.error)
  }, 60 * 60 * 1000) // Every hour
  
  // Run immediately on start
  scheduleHourlyMetering().catch(console.error)
}
