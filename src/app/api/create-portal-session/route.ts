import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPrisma } from '@/lib/prisma';
import { APP_URL } from '@/lib/config';

export async function POST(request: Request) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const prisma = getPrisma();
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.stripe_customer_id) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${APP_URL}/manage`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe portal error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
