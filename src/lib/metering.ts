import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export interface PricingConfig {
  price_per_mb_in: number
  price_per_mb_out: number
  price_per_gate: number
  price_per_audit_event: number
}

export interface MeteringUnits {
  bytes_in: number
  bytes_out: number
  gates_executed: number
  audit_writes: number
  wall_time_ms: number
}

/**
 * Metering Service - Track usage and calculate costs
 */
export class MeteringService {
  private pricing: PricingConfig
  
  constructor(pricing?: PricingConfig) {
    this.pricing = pricing || this.getDefaultPricing()
  }
  
  /**
   * Record metering for an evaluation
   */
  async recordUsage(
    tenantId: string,
    evaluationId: string,
    units: MeteringUnits
  ): Promise<{
    record_id: string
    cost_cents: number
  }> {
    const costCents = this.calculateCost(units)
    
    const record = await prisma.meteringRecord.create({
      data: {
        tenantId,
        evaluationId,
        bytesIn: units.bytes_in,
        bytesOut: units.bytes_out,
        gatesExecuted: units.gates_executed,
        auditWrites: units.audit_writes,
        wallTimeMs: units.wall_time_ms,
        pricePerMbIn: this.pricing.price_per_mb_in,
        pricePerMbOut: this.pricing.price_per_mb_out,
        pricePerGate: this.pricing.price_per_gate,
        pricePerAudit: this.pricing.price_per_audit_event,
        costCents,
      },
    })
    
    return {
      record_id: record.id,
      cost_cents: costCents,
    }
  }
  
  /**
   * Calculate cost from metering units
   */
  calculateCost(units: MeteringUnits): number {
    const mbIn = units.bytes_in / (1024 * 1024)
    const mbOut = units.bytes_out / (1024 * 1024)
    
    const costIn = Math.ceil(mbIn * this.pricing.price_per_mb_in)
    const costOut = Math.ceil(mbOut * this.pricing.price_per_mb_out)
    const costGates = units.gates_executed * this.pricing.price_per_gate
    const costAudit = units.audit_writes * this.pricing.price_per_audit_event
    
    return costIn + costOut + costGates + costAudit
  }
  
  /**
   * Aggregate usage for a period
   */
  async aggregateUsage(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<{
    ledger_id: string
    total_bytes_in: bigint
    total_bytes_out: bigint
    total_gates: bigint
    total_audit_writes: bigint
    total_cost_cents: bigint
    usage_hash: string
  }> {
    // Get all metering records in period
    const records = await prisma.meteringRecord.findMany({
      where: {
        tenantId,
        recordedAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    })
    
    // Aggregate
    const totals = records.reduce(
      (acc, r) => ({
        bytes_in: acc.bytes_in + BigInt(r.bytesIn),
        bytes_out: acc.bytes_out + BigInt(r.bytesOut),
        gates: acc.gates + BigInt(r.gatesExecuted),
        audit_writes: acc.audit_writes + BigInt(r.auditWrites),
        cost_cents: acc.cost_cents + BigInt(r.costCents),
      }),
      {
        bytes_in: 0n,
        bytes_out: 0n,
        gates: 0n,
        audit_writes: 0n,
        cost_cents: 0n,
      }
    )
    
    // Compute usage hash (for immutability proof)
    const usageHash = this.computeUsageHash({
      tenant_id: tenantId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      ...totals,
    })
    
    // Check if ledger entry already exists
    const existing = await prisma.usageLedger.findUnique({
      where: {
        tenantId_periodStart_periodEnd: {
          tenantId,
          periodStart,
          periodEnd,
        },
      },
    })
    
    if (existing) {
      return {
        ledger_id: existing.id,
        total_bytes_in: existing.totalBytesIn,
        total_bytes_out: existing.totalBytesOut,
        total_gates: existing.totalGates,
        total_audit_writes: existing.totalAuditWrites,
        total_cost_cents: existing.totalCostCents,
        usage_hash: existing.usageHash,
      }
    }
    
    // Create ledger entry
    const ledger = await prisma.usageLedger.create({
      data: {
        tenantId,
        periodStart,
        periodEnd,
        totalBytesIn: totals.bytes_in,
        totalBytesOut: totals.bytes_out,
        totalGates: totals.gates,
        totalAuditWrites: totals.audit_writes,
        totalCostCents: totals.cost_cents,
        usageHash,
      },
    })
    
    return {
      ledger_id: ledger.id,
      total_bytes_in: ledger.totalBytesIn,
      total_bytes_out: ledger.totalBytesOut,
      total_gates: ledger.totalGates,
      total_audit_writes: ledger.totalAuditWrites,
      total_cost_cents: ledger.totalCostCents,
      usage_hash: ledger.usageHash,
    }
  }
  
  /**
   * Get current month usage
   */
  async getCurrentMonthUsage(tenantId: string): Promise<{
    period_start: Date
    period_end: Date
    total_cost_cents: number
    projected_cost_cents: number
  }> {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    const records = await prisma.meteringRecord.findMany({
      where: {
        tenantId,
        recordedAt: {
          gte: periodStart,
          lt: now,
        },
      },
    })
    
    const totalCostCents = records.reduce((sum, r) => sum + r.costCents, 0)
    
    // Project to end of month
    const daysElapsed = now.getDate()
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const projectedCostCents = Math.ceil((totalCostCents / daysElapsed) * totalDaysInMonth)
    
    return {
      period_start: periodStart,
      period_end: periodEnd,
      total_cost_cents: totalCostCents,
      projected_cost_cents: projectedCostCents,
    }
  }
  
  /**
   * Mark ledger as reported to Stripe
   */
  async markStripeReported(
    ledgerId: string,
    stripeUsageId: string
  ): Promise<void> {
    await prisma.usageLedger.update({
      where: { id: ledgerId },
      data: {
        stripeReported: true,
        stripeUsageId,
      },
    })
  }
  
  /**
   * Get unreported usage ledgers
   */
  async getUnreportedLedgers(tenantId?: string): Promise<any[]> {
    return prisma.usageLedger.findMany({
      where: {
        stripeReported: false,
        ...(tenantId ? { tenantId } : {}),
      },
      orderBy: { periodEnd: 'asc' },
    })
  }
  
  /**
   * Compute deterministic usage hash
   */
  private computeUsageHash(data: any): string {
    const canonical = JSON.stringify(data, Object.keys(data).sort())
    return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex')
  }
  
  /**
   * Get default pricing from environment
   */
  private getDefaultPricing(): PricingConfig {
    return {
      price_per_mb_in: parseInt(process.env.PRICE_PER_MB_IN || '10'),
      price_per_mb_out: parseInt(process.env.PRICE_PER_MB_OUT || '15'),
      price_per_gate: parseInt(process.env.PRICE_PER_GATE || '1'),
      price_per_audit_event: parseInt(process.env.PRICE_PER_AUDIT_EVENT || '2'),
    }
  }
}

// Singleton instance
export const meteringService = new MeteringService()
