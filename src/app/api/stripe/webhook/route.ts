import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getDb();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId) {
        await db.prepare(`
          UPDATE users
          SET plan = 'pro', stripe_customer_id = ?, stripe_subscription_id = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(customerId, subscriptionId, userId).run();
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      if (status === 'active') {
        await db.prepare(`
          UPDATE users SET plan = 'pro', updated_at = datetime('now')
          WHERE stripe_customer_id = ?
        `).bind(customerId).run();
      } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
        await db.prepare(`
          UPDATE users SET plan = 'free', updated_at = datetime('now')
          WHERE stripe_customer_id = ?
        `).bind(customerId).run();
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await db.prepare(`
        UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = datetime('now')
        WHERE stripe_customer_id = ?
      `).bind(customerId).run();
      break;
    }
  }

  return NextResponse.json({ received: true });
}
