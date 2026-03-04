import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://gethowdi.com';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: 4900,
          product_data: {
            name: '25 Howdi Tokens',
            description: 'One-time pack of 25 AI search tokens — never expire',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/sponsors?tokens=purchased`,
    cancel_url: `${baseUrl}/sponsors`,
    customer_email: session.user.email,
    metadata: {
      userId: session.user.id ?? '',
      type: 'token_purchase',
      quantity: '25',
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
