import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { webhookRateLimiter, redis } from '@/lib/redis';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await webhookRateLimiter.limit(ip);
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Idempotency Check using Redis (expires in 24h)
  const eventId = event.id;
  const isProcessed = await redis.get(`stripe:event:${eventId}`);
  if (isProcessed) {
    return new NextResponse('Already processed', { status: 200 });
  }

  if (event.type === 'checkout.session.completed') {
    // Retrieve the user and qbank IDs from the metadata
    const userId = session.metadata?.userId;
    const qbankId = session.metadata?.qbankId;

    if (!userId || !qbankId) {
      console.error('Webhook missing metadata', session.id);
      return new NextResponse('Webhook missing metadata', { status: 400 });
    }

    try {
      await prisma.purchase.upsert({
        where: {
          userId_qbankId: {
            userId,
            qbankId,
          },
        },
        create: {
          userId,
          qbankId,
          amountPaidCents: session.amount_total || 0,
          stripeSessionId: session.id,
          status: 'active',
          expiresAt: null, // Lifetime access
        },
        update: {
          status: 'active',
          amountPaidCents: session.amount_total || 0,
          stripeSessionId: session.id,
          purchasedAt: new Date(),
        },
      });
      // Mark as processed only if successful
      await redis.set(`stripe:event:${eventId}`, 'true', { ex: 86400 });
    } catch (error) {
      console.error('Error fulfilling purchase', error);
      return new NextResponse('Database Error', { status: 500 });
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as any;
    
    // We need to find the purchase associated with this payment intent / charge
    if (charge.payment_intent && typeof charge.payment_intent === 'string') {
      try {
        // Stripe Sessions usually link to payment intents. Let's find by stripe session if possible,
        // or we just find the purchase where stripeSessionId matches the checkout session that created this payment intent.
        // It's easier to find the checkout session first.
        const sessions = await stripe.checkout.sessions.list({ payment_intent: charge.payment_intent, limit: 1 });
        if (sessions.data.length > 0) {
          const sessionId = sessions.data[0].id;
          const updated = await prisma.purchase.updateMany({
            where: { stripeSessionId: sessionId },
            data: { status: 'refunded' }
          });
          if (updated.count === 0) {
            // Found the Stripe session but no matching DB purchase — log for investigation
            console.error(`[REFUND] No purchase found for stripeSessionId ${sessionId} (payment_intent: ${charge.payment_intent})`);
          }
        } else {
          // No checkout session found for this payment_intent — return 500 so Stripe retries
          console.error(`[REFUND] No checkout session found for payment_intent ${charge.payment_intent}. Stripe will retry.`);
          return new NextResponse('No matching session found', { status: 500 });
        }
        await redis.set(`stripe:event:${eventId}`, 'true', { ex: 86400 });
      } catch (error) {
        console.error('Error processing refund', error);
        return new NextResponse('Database Error', { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
