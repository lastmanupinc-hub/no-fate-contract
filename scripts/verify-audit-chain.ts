#!/usr/bin/env tsx

/**
 * Verify Audit Chain Integrity
 */

import { PrismaClient } from '@prisma/client'
import { auditChain } from '../src/lib/audit-chain'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying audit chain integrity...\n')
  
  // Get all tenants
  const tenants = await prisma.tenant.findMany()
  
  if (tenants.length === 0) {
    console.log('No tenants found')
    return
  }
  
  let allValid = true
  
  for (const tenant of tenants) {
    process.stdout.write(`Checking tenant ${tenant.name}... `)
    
    const result = await auditChain.verifyChain(tenant.id)
    
    if (result.valid) {
      console.log(`✅ Valid (${result.total_events} events)`)
    } else {
      console.log(`❌ INVALID`)
      console.error(`  Error: ${result.error}`)
      console.error(`  First invalid sequence: ${result.first_invalid_sequence}`)
      allValid = false
    }
  }
  
  console.log()
  
  if (allValid) {
    console.log('✅ All audit chains are valid')
    process.exit(0)
  } else {
    console.error('❌ Some audit chains are invalid')
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
