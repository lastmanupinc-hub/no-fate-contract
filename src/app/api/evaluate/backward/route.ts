import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GateEngine } from '@/lib/gate-engine'
import { auditChain } from '@/lib/audit-chain'
import { meteringService } from '@/lib/metering'
import { billingService } from '@/lib/billing'
import { validateApiKey, canonicalize, byteSize } from '@/lib/api-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { BackwardRequestSchema } from '@/types/schemas'
import { 
  DIRECTION, 
  AUDIT_EVENT_TYPES, 
  REASON_CODES, 
  TERMINAL_STATES,
  DETERMINATION,
  FAILURE_MODE,
  mapToPublicDetermination,
  mapReasonCodeToFailureMode,
} from '@/types/constants'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // Validate API key
  const auth = await validateApiKey(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { tenant } = auth
  
  // Check rate limit
  const rateLimitResult = await checkRateLimit(tenant.id, '/api/evaluate/backward')
  if (!rateLimitResult.allowed) {
    // Rate limit exceeded: NO + NON_COMPLIANT with billing preserved
    const refusalPayload = {
      determination: DETERMINATION.NO,
      failure_mode: FAILURE_MODE.NON_COMPLIANT,
      reason: {
        code: REASON_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded',
        evidence: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.reset).toISOString(),
        },
      },
      audit_head_hash: await auditChain.getHeadHash(tenant.id),
      metering_units: {
        bytes_in: 0,
        bytes_out: 0, // calculated below
        gates_executed: 0,
        audit_writes: 1,
        wall_time_ms: Date.now() - startTime,
      },
    }
    const refusalCanonical = canonicalize(refusalPayload)
    refusalPayload.metering_units.bytes_out = byteSize(refusalCanonical)
    
    await meteringService.recordUsage(tenant.id, null, refusalPayload.metering_units)
    
    return NextResponse.json(refusalPayload, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
      },
    })
  }
  
  // Check billing status
  const billingStatus = await billingService.checkBillingStatus(tenant.id)
  if (!billingStatus.allow_service) {
    // Billing hold: NO + NON_COMPLIANT with billing preserved
    const refusalPayload = {
      determination: DETERMINATION.NO,
      failure_mode: FAILURE_MODE.NON_COMPLIANT,
      reason: {
        code: REASON_CODES.BILLING_HOLD,
        message: 'Billing hold in effect',
        evidence: { reason: billingStatus.reason },
      },
      audit_head_hash: await auditChain.getHeadHash(tenant.id),
      metering_units: {
        bytes_in: 0,
        bytes_out: 0, // calculated below
        gates_executed: 0,
        audit_writes: 1,
        wall_time_ms: Date.now() - startTime,
      },
    }
    const refusalCanonical = canonicalize(refusalPayload)
    refusalPayload.metering_units.bytes_out = byteSize(refusalCanonical)
    
    await meteringService.recordUsage(tenant.id, null, refusalPayload.metering_units)
    
    return NextResponse.json(refusalPayload, { status: 402 })
  }
  
  // Parse request
  let body: any
  try {
    body = await request.json()
  } catch (error) {
    // Malformed JSON: NO + INVALID_INPUT
    const refusalPayload = {
      determination: DETERMINATION.NO,
      failure_mode: FAILURE_MODE.INVALID_INPUT,
      reason: {
        code: REASON_CODES.MALFORMED_PAYLOAD,
        message: 'Invalid JSON',
        evidence: { error: String(error) },
      },
      audit_head_hash: await auditChain.getHeadHash(tenant.id),
      metering_units: {
        bytes_in: 0,
        bytes_out: 0, // calculated below
        gates_executed: 0,
        audit_writes: 1,
        wall_time_ms: Date.now() - startTime,
      },
    }
    const refusalCanonical = canonicalize(refusalPayload)
    refusalPayload.metering_units.bytes_out = byteSize(refusalCanonical)
    
    await meteringService.recordUsage(tenant.id, null, refusalPayload.metering_units)
    
    return NextResponse.json(refusalPayload, { status: 400 })
  }
  
  // Validate request schema
  const validation = BackwardRequestSchema.safeParse(body)
  if (!validation.success) {
    // Schema validation failure: NO + INVALID_INPUT
    const refusalPayload = {
      determination: DETERMINATION.NO,
      failure_mode: FAILURE_MODE.INVALID_INPUT,
      reason: {
        code: REASON_CODES.MALFORMED_PAYLOAD,
        message: 'Schema validation failed',
        evidence: { errors: validation.error.errors },
      },
      audit_head_hash: await auditChain.getHeadHash(tenant.id),
      metering_units: {
        bytes_in: 0,
        bytes_out: 0, // calculated below
        gates_executed: 0,
        audit_writes: 1,
        wall_time_ms: Date.now() - startTime,
      },
    }
    const refusalCanonical = canonicalize(refusalPayload)
    refusalPayload.metering_units.bytes_out = byteSize(refusalCanonical)
    
    await meteringService.recordUsage(tenant.id, null, refusalPayload.metering_units)
    
    return NextResponse.json(refusalPayload, { status: 400 })
  }
  
  const requestData = validation.data
  
  // Check idempotency
  const existingIdempotency = await prisma.idempotencyRecord.findUnique({
    where: { key: `${tenant.id}:${requestData.idempotency_key}` },
  })
  
  if (existingIdempotency && new Date() < existingIdempotency.expiresAt) {
    return NextResponse.json(existingIdempotency.response)
  }
  
  // Canonicalize request
  const requestCanonical = canonicalize(requestData)
  const bytesIn = byteSize(requestCanonical)
  
  let auditWriteCount = 0
  
  try {
    // Write audit: request received
    await auditChain.writeEvent({
      event_type: AUDIT_EVENT_TYPES.REQUEST_RECEIVED,
      tenant_id: tenant.id,
      payload: {
        direction: DIRECTION.BACKWARD,
        idempotency_key: requestData.idempotency_key,
        bytes_in: bytesIn,
      },
    })
    auditWriteCount++
    
    // Execute gate engine
    const gateEngine = new GateEngine()
    const result = await gateEngine.execute({
      direction: DIRECTION.BACKWARD,
      payload: requestData,
      observed_at: requestData.observed_at,
      evaluated_at: requestData.evaluated_at,
      decision_window_ms: requestData.decision_window_ms,
      context: requestData.context,
      core_ir: requestData.core_ir,
      render_targets: requestData.render_targets,
      cardinality_mode: requestData.cardinality_mode,
    })
    
    // Write audit: gate events
    for (const trace of result.gate_trace) {
      await auditChain.writeEvent({
        event_type: trace.passed ? AUDIT_EVENT_TYPES.GATE_PASSED : AUDIT_EVENT_TYPES.GATE_FAILED,
        tenant_id: tenant.id,
        payload: {
          gate: trace.gate,
          details: trace.details,
        },
      })
      auditWriteCount++
    }
    
    // Get audit head hash
    const auditHeadHash = await auditChain.getHeadHash(tenant.id)
    
    // Map internal terminal state to public determination (YES/NO + failure_mode)
    const determination = mapToPublicDetermination(result.terminal_state)
    
    // Build response with lawful YES/NO + failure_mode structure
    const responsePayload: any = {
      determination,
      audit_head_hash: auditHeadHash,
      metering_units: {
        bytes_in: bytesIn,
        bytes_out: 0, // will be calculated
        gates_executed: result.gate_trace.length,
        audit_writes: auditWriteCount + 2, // +1 for response_emitted, +1 for usage_recorded
        wall_time_ms: Date.now() - startTime,
      },
    }
    
    // If NO, include failure_mode and reason
    if (determination === DETERMINATION.NO) {
      responsePayload.failure_mode = mapReasonCodeToFailureMode(result.reason_code)
      responsePayload.reason = {
        code: result.reason_code,
        message: result.failed_gate ? `${result.failed_gate} gate failed` : 'Evaluation failed',
        evidence: result.evidence || {},
      }
    }
    
    // Include diagnostic details (gate_trace, temporal_status, etc.)
    responsePayload.gate_trace = result.gate_trace
    responsePayload.temporal_status = result.temporal_status
    if (result.staleness_ms !== undefined) {
      responsePayload.staleness_ms = result.staleness_ms
    }
    
    const responseCanonical = canonicalize(responsePayload)
    const bytesOut = byteSize(responseCanonical)
    responsePayload.metering_units.bytes_out = bytesOut
    
    // Store evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        tenantId: tenant.id,
        direction: DIRECTION.BACKWARD,
        idempotencyKey: requestData.idempotency_key,
        requestPayload: requestData,
        requestCanonical,
        bytesIn,
        observedAt: requestData.observed_at ? new Date(requestData.observed_at) : null,
        evaluatedAt: new Date(requestData.evaluated_at),
        decisionWindowMs: requestData.decision_window_ms,
        stalenessMs: result.staleness_ms,
        temporalStatus: result.temporal_status,
        terminalState: result.terminal_state, // Internal state for debugging
        failedGate: result.failed_gate,
        reasonCode: result.reason_code,
        gateTrace: result.gate_trace,
        evidence: result.evidence,
        responsePayload, // Contains public determination/failure_mode
        responseCanonical,
        bytesOut,
        gatesExecuted: result.gate_trace.length,
        auditWrites: auditWriteCount + 2,
        wallTimeMs: Date.now() - startTime,
        auditHeadHash,
      },
    })
    
    // Write audit: response emitted
    await auditChain.writeEvent({
      event_type: AUDIT_EVENT_TYPES.RESPONSE_EMITTED,
      tenant_id: tenant.id,
      evaluation_id: evaluation.id,
      payload: {
        determination: responsePayload.determination,
        failure_mode: responsePayload.failure_mode,
        bytes_out: bytesOut,
      },
    })
    auditWriteCount++
    
    // Record metering
    await meteringService.recordUsage(tenant.id, evaluation.id, {
      bytes_in: bytesIn,
      bytes_out: bytesOut,
      gates_executed: result.gate_trace.length,
      audit_writes: auditWriteCount + 1,
      wall_time_ms: Date.now() - startTime,
    })
    
    // Write audit: usage recorded
    await auditChain.writeEvent({
      event_type: AUDIT_EVENT_TYPES.USAGE_RECORDED,
      tenant_id: tenant.id,
      evaluation_id: evaluation.id,
      payload: {
        bytes_in: bytesIn,
        bytes_out: bytesOut,
        gates_executed: result.gate_trace.length,
      },
    })
    
    // Store idempotency record
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await prisma.idempotencyRecord.upsert({
      where: { key: `${tenant.id}:${requestData.idempotency_key}` },
      create: {
        key: `${tenant.id}:${requestData.idempotency_key}`,
        tenantId: tenant.id,
        response: responsePayload,
        expiresAt,
      },
      update: {
        response: responsePayload,
        expiresAt,
      },
    })
    
    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Backward evaluation error:', error)
    
    // Internal error: NO + INVALID_INPUT with billing preserved
    const errorPayload = {
      determination: DETERMINATION.NO,
      failure_mode: FAILURE_MODE.INVALID_INPUT,
      reason: {
        code: REASON_CODES.MALFORMED_PAYLOAD,
        message: 'Internal error',
        evidence: { error: String(error) },
      },
      audit_head_hash: await auditChain.getHeadHash(tenant.id),
      metering_units: {
        bytes_in: 0,
        bytes_out: 0, // calculated below
        gates_executed: 0,
        audit_writes: auditWriteCount || 1,
        wall_time_ms: Date.now() - startTime,
      },
    }
    const errorCanonical = canonicalize(errorPayload)
    errorPayload.metering_units.bytes_out = byteSize(errorCanonical)
    
    await meteringService.recordUsage(tenant.id, null, errorPayload.metering_units)
    
    return NextResponse.json(errorPayload, { status: 500 })
  }
}
