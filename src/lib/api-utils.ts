import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get tenant by API key
 */
export async function getTenantByApiKey(apiKey: string) {
  return prisma.tenant.findUnique({
    where: { apiKey },
  })
}

/**
 * Validate API key and return tenant
 */
export async function validateApiKey(
  request: Request
): Promise<{ tenant: any } | { error: string; status: number }> {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return {
      error: 'Missing API key',
      status: 401,
    }
  }
  
  const tenant = await getTenantByApiKey(apiKey)
  
  if (!tenant) {
    return {
      error: 'Invalid API key',
      status: 401,
    }
  }
  
  return { tenant }
}

/**
 * Canonicalize JSON (deterministic)
 */
export function canonicalize(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

/**
 * Calculate byte size of string
 */
export function byteSize(str: string): number {
  return Buffer.byteLength(str, 'utf8')
}
