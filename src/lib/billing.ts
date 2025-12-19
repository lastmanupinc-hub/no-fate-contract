import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import { BILLING_STATUS } from '@/types/constants'
import { getConfig } from './config'

const prisma = new PrismaClient()
const config = getConfig()

const stripeEnabled = process.env.BILLING_MODE === 'production'
const stripe = stripeEnabled && config.STRIPE_SECRET_KEY
  ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' as any })
  : null

/**
 * Billing Service - Stripe integration for metered usage billing
 */
export class BillingService {
  /**
   * Create Stripe customer for tenant
   */
  async createCustomer(tenantId: string, email: string, name: string): Promise<string> {
    if (!stripeEnabled || !stripe) {
      // Mock mode - generate fake customer ID
      const mockCustomerId = `cus_mock_${tenantId.substring(0, 8)}`
      
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: mockCustomerId },
      })
      
      return mockCustomerId
    }
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenant_id: tenantId,
      },
    })
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customer.id },
    })
    
    return customer.id
  }
  
  /**
   * Create metered subscription
   */
  async createSubscription(
    tenantId: string,
    customerId: string
  ): Promise<string> {
    if (!stripeEnabled || !stripe) {
      // Mock mode
      const mockSubId = `sub_mock_${tenantId.substring(0, 8)}`
      
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { 
          stripeSubscriptionId: mockSubId,
          billingStatus: BILLING_STATUS.ACTIVE,
        },
      })
      
      return mockSubId
    }
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: config.STRIPE_METERED_PRICE_ID,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        stripeSubscriptionId: subscription.id,
        billingStatus: BILLING_STATUS.ACTIVE,
      },
    })
    
    return subscription.id
  }
  
  /**
   * Report usage to Stripe
   */
  async reportUsage(
    subscriptionId: string,
    quantity: number,
    timestamp: Date,
    idempotencyKey: string
  ): Promise<string> {
    if (!stripeEnabled || !stripe) {
      // Mock mode - return fake usage record ID
      return `ur_mock_${idempotencyKey.substring(0, 8)}`
    }
    
    // Get subscription to find the metered price item
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const meteredItem = subscription.items.data[0]
    
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      meteredItem.id,
      {
        quantity,
        timestamp: Math.floor(timestamp.getTime() / 1000),
        action: 'increment',
      },
      {
        idempotencyKey,
      }
    )
    
    return usageRecord.id
  }
  
  /**
   * Check billing status and apply service policy
   */
  async checkBillingStatus(tenantId: string): Promise<{
    status: string
    allow_service: boolean
    reason?: string
  }> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        billingStatus: true,
        billingGraceUntil: true,
      },
    })
    
    if (!tenant) {
      return {
        status: 'unknown',
        allow_service: false,
        reason: 'Tenant not found',
      }
    }
    
    // Active - allow
    if (tenant.billingStatus === BILLING_STATUS.ACTIVE) {
      return {
        status: BILLING_STATUS.ACTIVE,
        allow_service: true,
      }
    }
    
    // Grace period - check expiry
    if (tenant.billingStatus === BILLING_STATUS.GRACE) {
      if (tenant.billingGraceUntil && new Date() <= tenant.billingGraceUntil) {
        return {
          status: BILLING_STATUS.GRACE,
          allow_service: true,
          reason: `Grace period until ${tenant.billingGraceUntil.toISOString()}`,
        }
      }
      
      // Grace expired - suspend
      await this.suspendService(tenantId)
      
      return {
        status: BILLING_STATUS.SUSPENDED,
        allow_service: false,
        reason: 'Grace period expired',
      }
    }
    
    // Suspended - deny
    return {
      status: BILLING_STATUS.SUSPENDED,
      allow_service: false,
      reason: 'Service suspended due to payment failure',
    }
  }
  
  /**
   * Enter grace period
   */
  async enterGracePeriod(tenantId: string): Promise<void> {
    const graceDays = parseInt(process.env.BILLING_GRACE_PERIOD_DAYS || '3')
    const graceUntil = new Date()
    graceUntil.setDate(graceUntil.getDate() + graceDays)
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingStatus: BILLING_STATUS.GRACE,
        billingGraceUntil: graceUntil,
      },
    })
  }
  
  /**
   * Suspend service
   */
  async suspendService(tenantId: string): Promise<void> {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingStatus: BILLING_STATUS.SUSPENDED,
        billingGraceUntil: null,
      },
    })
  }
  
  /**
   * Reactivate service
   */
  async reactivateService(tenantId: string): Promise<void> {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingStatus: BILLING_STATUS.ACTIVE,
        billingGraceUntil: null,
      },
    })
  }
  
  /**
   * Handle invoice.payment_failed webhook
   */
  async handlePaymentFailed(invoiceId: string, customerId: string): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { stripeCustomerId: customerId },
    })
    
    if (!tenant) {
      console.error(`Tenant not found for Stripe customer ${customerId}`)
      return
    }
    
    await this.enterGracePeriod(tenant.id)
    
    await prisma.invoiceEvent.create({
      data: {
        tenantId: tenant.id,
        stripeInvoiceId: invoiceId,
        eventType: 'invoice.payment_failed',
        status: 'payment_failed',
        payload: { customerId },
      },
    })
  }
  
  /**
   * Handle invoice.paid webhook
   */
  async handlePaymentSucceeded(
    invoiceId: string,
    customerId: string,
    amountPaid: number
  ): Promise<void> {
    const tenant = await prisma.tenant.findUnique({
      where: { stripeCustomerId: customerId },
    })
    
    if (!tenant) {
      console.error(`Tenant not found for Stripe customer ${customerId}`)
      return
    }
    
    // Reactivate if suspended/grace
    if (tenant.billingStatus !== BILLING_STATUS.ACTIVE) {
      await this.reactivateService(tenant.id)
    }
    
    await prisma.invoiceEvent.create({
      data: {
        tenantId: tenant.id,
        stripeInvoiceId: invoiceId,
        eventType: 'invoice.paid',
        status: 'paid',
        amountPaid,
        payload: { customerId, amountPaid },
      },
    })
  }
  
  /**
   * Create checkout session for payment method
   */
  async createCheckoutSession(
    customerId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    if (!stripeEnabled || !stripe) {
      return 'mock_checkout_session'
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    
    return session.url!
  }
  
  /**
   * Get billing portal URL
   */
  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    if (!stripeEnabled || !stripe) {
      return returnUrl
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    
    return session.url
  }
}

// Singleton instance
export const billingService = new BillingService()
