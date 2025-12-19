import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { getConfig } from '../lib/config'

const config = getConfig()
const connection = new IORedis(config.REDIS_URL)

/**
 * Invoice Processor Worker
 * Handles invoice-related background tasks
 */

export const invoiceQueue = new Queue('invoice-processing', { connection })

interface InvoiceJobData {
  type: 'finalize' | 'send_reminder' | 'suspend_service'
  tenant_id: string
  invoice_id?: string
}

const invoiceWorker = new Worker<InvoiceJobData>(
  'invoice-processing',
  async (job) => {
    const { type, tenant_id, invoice_id } = job.data
    
    console.log(`Processing invoice job: ${type} for tenant ${tenant_id}`)
    
    switch (type) {
      case 'finalize':
        // Handle invoice finalization tasks
        console.log(`Finalizing invoice ${invoice_id}`)
        break
        
      case 'send_reminder':
        // Send payment reminder
        console.log(`Sending payment reminder for tenant ${tenant_id}`)
        break
        
      case 'suspend_service':
        // Suspend service after grace period
        console.log(`Suspending service for tenant ${tenant_id}`)
        const { billingService } = await import('@/lib/billing')
        await billingService.suspendService(tenant_id)
        break
    }
    
    return { success: true }
  },
  {
    connection,
    concurrency: 3,
  }
)

invoiceWorker.on('completed', (job) => {
  console.log(`Invoice job ${job.id} completed`)
})

invoiceWorker.on('failed', (job, err) => {
  console.error(`Invoice job ${job?.id} failed:`, err)
})

// Run worker if executed directly
if (require.main === module) {
  console.log('Invoice processor worker started')
}
