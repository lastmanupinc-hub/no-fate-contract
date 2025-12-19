#!/usr/bin/env tsx

/**
 * Seed database with demo data
 */

import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { billingService } from '../src/lib/billing'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')
  
  // Create demo tenant
  const apiKey = `dk_demo_${crypto.randomBytes(16).toString('hex')}`
  const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Tenant',
      apiKey,
      apiKeyHash,
      billingStatus: 'active',
    },
  })
  
  console.log('✅ Created demo tenant:')
  console.log(`   ID: ${tenant.id}`)
  console.log(`   API Key: ${apiKey}`)
  console.log()
  
  // Create Stripe customer (mock mode)
  const customerId = await billingService.createCustomer(
    tenant.id,
    'demo@example.com',
    'Demo Tenant'
  )
  
  console.log('✅ Created Stripe customer:')
  console.log(`   Customer ID: ${customerId}`)
  console.log()
  
  // Create subscription
  const subscriptionId = await billingService.createSubscription(
    tenant.id,
    customerId
  )
  
  console.log('✅ Created subscription:')
  console.log(`   Subscription ID: ${subscriptionId}`)
  console.log()
  
  console.log('🎉 Seeding complete!')
  console.log()
  console.log('Test the API with:')
  console.log()
  console.log('curl -X POST http://localhost:3000/api/evaluate/forward \\')
  console.log(`  -H "x-api-key: ${apiKey}" \\`)
  console.log('  -H "Content-Type: application/json" \\')
  console.log('  -d \'{')
  console.log('    "text": "Sample evaluation text",')
  console.log('    "evaluated_at": "'+ new Date().toISOString() + '",')
  console.log('    "observed_at": "'+ new Date().toISOString() + '",')
  console.log('    "decision_window_ms": 5000,')
  console.log('    "idempotency_key": "test-' + Date.now() + '"')
  console.log('  }\'')
  console.log()
}

main()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
