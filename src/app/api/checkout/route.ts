import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { qbankId } = await req.json();

    if (!qbankId) {
      return new NextResponse('QBank ID is required', { status: 400 });
    }

    const qbank = await prisma.qBank.findUnique({
      where: { id: qbankId },
    });

    if (!qbank || !qbank.isActive) {
      return new NextResponse('QBank not found or inactive', { status: 404 });
    }

    // Check if the user already purchased this qbank
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_qbankId: {
          userId: session.user.id,
          qbankId: qbank.id,
        },
      },
    });

    if (existingPurchase && existingPurchase.status === 'active') {
      return new NextResponse('You already own this QBank', { status: 400 });
    }

    // Construct base URL for redirects, matching the exact domain the user is browsing
    const reqHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const reqProto = req.headers.get('x-forwarded-proto') || (reqHost?.includes('localhost') ? 'http' : 'https');
    const baseUrl = reqHost 
      ? `${reqProto}://${reqHost}` 
      : (process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL.replace(/\/+$/, '') : 'http://localhost:3000');

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${baseUrl}/dashboard/${qbank.slug}?purchased=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/qbanks/${qbank.slug}`,
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'auto',
      customer_email: session.user.email!,
      line_items: [
        {
          price_data: {
            currency: qbank.currency.toLowerCase(),
            product_data: {
              name: qbank.title,
              description: qbank.description,
            },
            unit_amount: qbank.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        qbankId: qbank.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('[CHECKOUT_ERROR]', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal server error', { status: 500 });
  }
}
