import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const user = await db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?')
    .bind(session.user.id)
    .first<{ stripe_customer_id: string | null }>();

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://gethowdi.com';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${baseUrl}/subscribe`,
  });

  return NextResponse.json({ url: portalSession.url });
}
