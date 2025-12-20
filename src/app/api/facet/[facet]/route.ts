import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'

/**
 * Facet Proxy Endpoint
 * 
 * Routes evaluation requests to the appropriate facet runtime endpoint.
 * This is pure routing - no logic is added.
 */

const FACET_RUNTIME_URL = process.env.FACET_RUNTIME_URL || 'http://localhost:8000'

const VALID_FACETS = [
  'ai',
  'banking',
  'government',
  'tsa',
  'defense',
  'energy',
  'insurance',
  'spacex'
] as const

type Facet = typeof VALID_FACETS[number]

export async function POST(
  request: NextRequest,
  { params }: { params: { facet: string } }
) {
  const startTime = Date.now()
  const facet = params.facet as Facet

  // Validate facet
  if (!VALID_FACETS.includes(facet as Facet)) {
    return NextResponse.json(
      { 
        error: 'Invalid facet',
        outcome: 'INVALID_INPUT',
        reason: `Unknown facet: ${facet}. Valid facets: ${VALID_FACETS.join(', ')}`
      },
      { status: 400 }
    )
  }

  try {
    // Get tenant from auth
    const { orgId } = auth()
    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized', outcome: 'INVALID_INPUT' },
        { status: 401 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { clerkOrgId: orgId }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found', outcome: 'INVALID_INPUT' },
        { status: 404 }
      )
    }

    // Parse request body
    const payload = await request.json()

    // Call facet runtime (frozen logic execution)
    const facetResponse = await fetch(`${FACET_RUNTIME_URL}/facet/${facet}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload })
    })

    if (!facetResponse.ok) {
      const errorText = await facetResponse.text()
      throw new Error(`Facet runtime error: ${errorText}`)
    }

    const decision = await facetResponse.json()

    // Record evaluation (audit + metering)
    const requestSize = JSON.stringify(payload).length
    const responseSize = JSON.stringify(decision).length

    const evaluation = await prisma.evaluation.create({
      data: {
        tenantId: tenant.id,
        direction: 'forward',
        idempotencyKey: `${facet}-${Date.now()}-${Math.random()}`,
        requestPayload: payload,
        requestSizeBytes: requestSize,
        facet: facet,
        outcome: decision.outcome,
        responsePayload: decision,
        responseSizeBytes: responseSize,
        latencyMs: Date.now() - startTime,
        evaluatedAt: new Date()
      }
    })

    // Record metering (outcome-neutral billing)
    await prisma.meteringRecord.create({
      data: {
        tenantId: tenant.id,
        evaluationId: evaluation.id,
        eventType: 'evaluation',
        quantity: requestSize + responseSize,
        unit: 'byte',
        metadata: {
          facet,
          outcome: decision.outcome,
          request_bytes: requestSize,
          response_bytes: responseSize
        }
      }
    })

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        tenantId: tenant.id,
        evaluationId: evaluation.id,
        eventType: 'evaluation_completed',
        outcome: decision.outcome,
        metadata: {
          facet,
          latency_ms: evaluation.latencyMs,
          billable_bytes: requestSize + responseSize
        }
      }
    })

    return NextResponse.json(decision)

  } catch (error) {
    console.error(`Facet evaluation error (${facet}):`, error)
    
    // All evaluation attempts are billable, including errors
    return NextResponse.json(
      {
        outcome: 'INVALID_INPUT',
        reason: error instanceof Error ? error.message : 'Unknown error',
        billable: true
      },
      { status: 500 }
    )
  }
}
