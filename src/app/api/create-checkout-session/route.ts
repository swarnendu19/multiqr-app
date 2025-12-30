import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPrisma } from '@/lib/prisma';
import { APP_URL } from '@/lib/config';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('user-id');
        console.log('[Checkout] Request received. UserId:', userId);

        if (!userId) {
            console.error('[Checkout] Missing user-id header');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { priceId } = body;
        console.log('[Checkout] PriceId:', priceId);

        if (!priceId) {
            console.error('[Checkout] Missing priceId in body');
            return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
        }

        // Check for Stripe key availability (do not log the key)
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('[Checkout] STRIPE_SECRET_KEY is missing in environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const prisma = getPrisma();
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            console.error('[Checkout] User not found in database:', userId);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let customerId = user.stripe_customer_id;

        if (!customerId) {
            console.log('[Checkout] Creating new Stripe customer for user:', user.email);
            try {
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.full_name || undefined,
                    metadata: { userId: user.id },
                });
                customerId = customer.id;
                await prisma.user.update({
                    where: { id: userId },
                    data: { stripe_customer_id: customerId },
                });
            } catch (stripeError: any) {
                console.error('[Checkout] Failed to create Stripe customer:', stripeError);
                throw stripeError;
            }
        }

        console.log('[Checkout] Creating checkout session for customer:', customerId);
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${APP_URL}/manage?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${APP_URL}/pricing`,
            metadata: { userId: user.id },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('[Checkout] Unhandled error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
