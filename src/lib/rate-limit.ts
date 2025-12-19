import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { auditChain } from './audit-chain'
import { AUDIT_EVENT_TYPES, REASON_CODES } from '@/types/constants'
import { getConfig } from './config'

const config = getConfig()

/**
 * Rate Limit Service
 * 
 * Per Diamond Standard Docking Law v1.0.0:
 * - Rate limit exceeded returns: NO + NON_COMPLIANT with RATE_LIMIT_EXCEEDED
 * - HTTP 429 status
 * - Billing preserved (metering recorded for refusal)
 * - Append-only audit log entry
 * 
 * Refusal response formatting is handled in API routes to ensure lawful
 * determination/failure_mode structure with metering preservation.
 */

// Initialize Redis client
let redis: Redis | null = null
let ratelimit: Ratelimit | null = null

// Only initialize if Upstash credentials are provided
if (config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: config.UPSTASH_REDIS_REST_URL,
    token: config.UPSTASH_REDIS_REST_TOKEN,
  })
  
  const limitPerMinute = config.DEFAULT_RATE_LIMIT || 100
  
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limitPerMinute, '1 m'),
    prefix: 'ratelimit',
    analytics: true,
  })
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
  reason?: string
}

/**
 * Check rate limit for tenant
 * Returns deterministic refusal if limit exceeded
 */
export async function checkRateLimit(
  tenantId: string,
  endpoint: string
): Promise<RateLimitResult> {
  // If rate limiting not configured, allow all requests
  if (!ratelimit) {
    return {
      allowed: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      reason: 'Rate limiting not configured',
    }
  }
  
  const identifier = `tenant:${tenantId}`
  const result = await ratelimit.limit(identifier)
  
  // Log rate limit decision to audit chain
  if (!result.success) {
    await auditChain.writeEvent({
      event_type: AUDIT_EVENT_TYPES.RATE_LIMIT_EXCEEDED,
      tenant_id: tenantId,
      payload: {
        endpoint,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        timestamp: new Date().toISOString(),
      },
    })
  }
  
  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    reason: result.success ? undefined : 'Rate limit exceeded',
  }
}

/**
 * Get current rate limit status (without consuming a token)
 */
export async function getRateLimitStatus(tenantId: string): Promise<{
  limit: number
  remaining: number
  reset: number
}> {
  if (!redis) {
    return { limit: 0, remaining: 0, reset: 0 }
  }
  
  // Query Redis directly for current status
  const identifier = `tenant:${tenantId}`
  const key = `ratelimit:${identifier}`
  
  try {
    const data = await redis.get(key)
    
    if (!data) {
      return {
        limit: config.DEFAULT_RATE_LIMIT || 100,
        remaining: config.DEFAULT_RATE_LIMIT || 100,
        reset: Date.now() + 60000,
      }
    }
    
    // Parse Upstash ratelimit data structure
    // This is implementation-specific and may need adjustment
    return {
      limit: config.DEFAULT_RATE_LIMIT || 100,
      remaining: 0, // Would need to parse from data
      reset: Date.now() + 60000,
    }
  } catch (error) {
    console.error('Failed to get rate limit status:', error)
    return { limit: 0, remaining: 0, reset: 0 }
  }
}
