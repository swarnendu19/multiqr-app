import Stripe from 'stripe';
import { Agent } from 'https';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
    typescript: true,
    httpAgent: new Agent({ keepAlive: true, family: 4 }),
});
