import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { billingService } from '@/lib/billing'
import { auditChain } from '@/lib/audit-chain'
import { checkRateLimit, formatRateLimitRefusal } from '@/lib/rate-limit'
import { AUDIT_EVENT_TYPES } from '@/types/constants'
import { getConfig } from '@/lib/config'

const config = getConfig()
const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' as any })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      config.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  // Apply rate limiting using Stripe customer ID as identifier
  const customerId = (event.data.object as any).customer as string | undefined
  if (customerId) {
    const rateLimitResult = await checkRateLimit(`stripe:${customerId}`, '/api/webhooks/stripe')
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        formatRateLimitRefusal(rateLimitResult),
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          },
        }
      )
    }
  }
  
  // Handle event
  try {
    switch (event.type) {
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await billingService.handlePaymentFailed(invoice.id, invoice.customer as string)
        
        // Write audit event
        await auditChain.writeEvent({
          event_type: AUDIT_EVENT_TYPES.INVOICE_STATE_CHANGED,
          tenant_id: '', // Will be set by handler
          payload: {
            stripe_event: event.type,
            invoice_id: invoice.id,
            customer_id: invoice.customer,
          },
        })
        break
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await billingService.handlePaymentSucceeded(
          invoice.id,
          invoice.customer as string,
          invoice.amount_paid
        )
        
        // Write audit event
        await auditChain.writeEvent({
          event_type: AUDIT_EVENT_TYPES.INVOICE_STATE_CHANGED,
          tenant_id: '',
          payload: {
            stripe_event: event.type,
            invoice_id: invoice.id,
            customer_id: invoice.customer,
            amount_paid: invoice.amount_paid,
          },
        })
        break
      }
      
      case 'invoice.created':
      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Write audit event
        await auditChain.writeEvent({
          event_type: AUDIT_EVENT_TYPES.INVOICE_STATE_CHANGED,
          tenant_id: '',
          payload: {
            stripe_event: event.type,
            invoice_id: invoice.id,
            customer_id: invoice.customer,
            amount_due: invoice.amount_due,
          },
        })
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}
