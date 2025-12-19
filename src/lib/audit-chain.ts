import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import type { AuditEventType } from '@/types/constants'
import { canonicalize } from './canonicalize'

const prisma = new PrismaClient()

export interface AuditEventPayload {
  event_type: AuditEventType
  tenant_id: string
  evaluation_id?: string
  payload: any
}

/**
 * Audit Chain - Append-only, hash-chained audit logging
 * 
 * Each event is linked to the previous via cryptographic hash:
 * this_hash = sha256(prev_hash + canonical_json(event_without_hashes))
 */
export class AuditChain {
  /**
   * Write audit event (append-only)
   */
  async writeEvent(event: AuditEventPayload): Promise<{
    event_id: string
    this_hash: string
    sequence_number: bigint
  }> {
    // Get previous hash for this tenant
    const prevEvent = await prisma.auditEvent.findFirst({
      where: { tenantId: event.tenant_id },
      orderBy: { sequenceNumber: 'desc' },
      select: { thisHash: true, sequenceNumber: true },
    })
    
    const prevHash = prevEvent?.thisHash || 'GENESIS'
    
    // Canonicalize event payload (deterministic JSON)
    const canonical = canonicalize({
      event_type: event.event_type,
      tenant_id: event.tenant_id,
      evaluation_id: event.evaluation_id,
      payload: event.payload,
      timestamp: new Date().toISOString(),
    })
    
    // Compute hash
    const thisHash = this.computeHash(prevHash, canonical)
    
    // Write to database (append-only)
    const auditEvent = await prisma.auditEvent.create({
      data: {
        tenantId: event.tenant_id,
        eventType: event.event_type,
        evaluationId: event.evaluation_id,
        payload: event.payload,
        prevHash,
        thisHash,
      },
    })
    
    return {
      event_id: auditEvent.id,
      this_hash: thisHash,
      sequence_number: auditEvent.sequenceNumber,
    }
  }
  
  /**
   * Write multiple events in transaction
   */
  async writeEvents(events: AuditEventPayload[]): Promise<{
    count: number
    head_hash: string
  }> {
    if (events.length === 0) {
      throw new Error('No events to write')
    }
    
    // All events must be for same tenant
    const tenantId = events[0].tenant_id
    if (!events.every(e => e.tenant_id === tenantId)) {
      throw new Error('All events must belong to same tenant')
    }
    
    // Get current head
    const prevEvent = await prisma.auditEvent.findFirst({
      where: { tenantId },
      orderBy: { sequenceNumber: 'desc' },
      select: { thisHash: true },
    })
    
    let prevHash = prevEvent?.thisHash || 'GENESIS'
    let headHash = prevHash
    
    // Write events in sequence
    await prisma.$transaction(async (tx) => {
      for (const event of events) {
        const canonical = canonicalize({
          event_type: event.event_type,
          tenant_id: event.tenant_id,
          evaluation_id: event.evaluation_id,
          payload: event.payload,
          timestamp: new Date().toISOString(),
        })
        
        const thisHash = this.computeHash(prevHash, canonical)
        
        await tx.auditEvent.create({
          data: {
            tenantId: event.tenant_id,
            eventType: event.event_type,
            evaluationId: event.evaluation_id,
            payload: event.payload,
            prevHash,
            thisHash,
          },
        })
        
        prevHash = thisHash
        headHash = thisHash
      }
    })
    
    return {
      count: events.length,
      head_hash: headHash,
    }
  }
  
  /**
   * Verify chain integrity for a tenant
   */
  async verifyChain(tenantId: string): Promise<{
    valid: boolean
    total_events: number
    first_invalid_sequence?: bigint
    error?: string
  }> {
    const events = await prisma.auditEvent.findMany({
      where: { tenantId },
      orderBy: { sequenceNumber: 'asc' },
    })
    
    if (events.length === 0) {
      return { valid: true, total_events: 0 }
    }
    
    let prevHash = 'GENESIS'
    
    for (const event of events) {
      // Verify prevHash matches
      if (event.prevHash !== prevHash) {
        return {
          valid: false,
          total_events: events.length,
          first_invalid_sequence: event.sequenceNumber,
          error: `Hash chain broken at sequence ${event.sequenceNumber}: expected prevHash ${prevHash}, got ${event.prevHash}`,
        }
      }
      
      // Recompute hash
      const canonical = canonicalize({
        event_type: event.eventType,
        tenant_id: event.tenantId,
        evaluation_id: event.evaluationId,
        payload: event.payload,
        timestamp: event.createdAt.toISOString(),
      })
      
      const expectedHash = this.computeHash(prevHash, canonical)
      
      if (event.thisHash !== expectedHash) {
        return {
          valid: false,
          total_events: events.length,
          first_invalid_sequence: event.sequenceNumber,
          error: `Hash mismatch at sequence ${event.sequenceNumber}: expected ${expectedHash}, got ${event.thisHash}`,
        }
      }
      
      prevHash = event.thisHash
    }
    
    return {
      valid: true,
      total_events: events.length,
    }
  }
  
  /**
   * Get chain head hash
   */
  async getHeadHash(tenantId: string): Promise<string> {
    const event = await prisma.auditEvent.findFirst({
      where: { tenantId },
      orderBy: { sequenceNumber: 'desc' },
      select: { thisHash: true },
    })
    
    return event?.thisHash || 'GENESIS'
  }
  
  /**
   * Get audit events for an evaluation
   */
  async getEventsForEvaluation(evaluationId: string): Promise<any[]> {
    return prisma.auditEvent.findMany({
      where: { evaluationId },
      orderBy: { sequenceNumber: 'asc' },
    })
  }
  
  /**
   * Compute SHA-256 hash
   */
  private computeHash(prevHash: string, canonical: string): string {
    const data = prevHash + canonical
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
  }
}

// Singleton instance
export const auditChain = new AuditChain()
