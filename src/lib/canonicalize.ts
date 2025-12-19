/**
 * Input Canonicalization - NO FATE CONTRACT
 * 
 * Deep canonical JSON serialization.
 * Same logical input MUST hash identically.
 * Fail evaluation if canonicalization is impossible.
 */

import crypto from 'crypto'

export class CanonicalizeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CanonicalizeError'
  }
}

/**
 * Canonicalize object to deterministic JSON string
 * 
 * Rules:
 * - Keys sorted alphabetically
 * - No whitespace
 * - Null values preserved
 * - Undefined values removed
 * - NaN, Infinity rejected
 * - Functions rejected
 * - Circular references rejected
 */
export function canonicalize(obj: any): string {
  const seen = new WeakSet()
  
  function canonicalizeRecursive(value: any): any {
    // Null
    if (value === null) {
      return null
    }
    
    // Undefined - omit from output
    if (value === undefined) {
      return undefined
    }
    
    // Number
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new CanonicalizeError(
          `Cannot canonicalize non-finite number: ${value}`
        )
      }
      return value
    }
    
    // String, Boolean
    if (typeof value === 'string' || typeof value === 'boolean') {
      return value
    }
    
    // Function - reject
    if (typeof value === 'function') {
      throw new CanonicalizeError('Cannot canonicalize functions')
    }
    
    // Symbol - reject
    if (typeof value === 'symbol') {
      throw new CanonicalizeError('Cannot canonicalize symbols')
    }
    
    // BigInt - convert to string with suffix
    if (typeof value === 'bigint') {
      return `${value.toString()}n`
    }
    
    // Array
    if (Array.isArray(value)) {
      // Check circular reference
      if (seen.has(value)) {
        throw new CanonicalizeError('Circular reference detected in array')
      }
      seen.add(value)
      
      const result = value.map(item => canonicalizeRecursive(item))
      seen.delete(value)
      return result
    }
    
    // Date - ISO string
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        throw new CanonicalizeError('Cannot canonicalize invalid Date')
      }
      return value.toISOString()
    }
    
    // Object
    if (typeof value === 'object') {
      // Check circular reference
      if (seen.has(value)) {
        throw new CanonicalizeError('Circular reference detected in object')
      }
      seen.add(value)
      
      const result: Record<string, any> = {}
      
      // Sort keys alphabetically
      const keys = Object.keys(value).sort()
      
      for (const key of keys) {
        const canonicalValue = canonicalizeRecursive(value[key])
        
        // Omit undefined values
        if (canonicalValue !== undefined) {
          result[key] = canonicalValue
        }
      }
      
      seen.delete(value)
      return result
    }
    
    throw new CanonicalizeError(`Cannot canonicalize type: ${typeof value}`)
  }
  
  try {
    const canonical = canonicalizeRecursive(obj)
    return JSON.stringify(canonical)
  } catch (error) {
    if (error instanceof CanonicalizeError) {
      throw error
    }
    throw new CanonicalizeError(`Canonicalization failed: ${error}`)
  }
}

/**
 * Compute SHA-256 hash of canonical representation
 */
export function hashCanonical(obj: any): string {
  const canonical = canonicalize(obj)
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex')
}

/**
 * Verify that two objects have identical canonical representation
 */
export function areCanonicallyEqual(a: any, b: any): boolean {
  try {
    return canonicalize(a) === canonicalize(b)
  } catch {
    return false
  }
}
