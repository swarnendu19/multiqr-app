import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.stripe_customer_id) {
            return NextResponse.json({ status: null });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: 'active',
            limit: 1,
        });

        const status = subscriptions.data.length > 0 ? 'active' : null;

        if (user.subscription_status !== status) {
            await prisma.user.update({
                where: { id: userId },
                data: { subscription_status: status },
            });
        }

        return NextResponse.json({ status });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
