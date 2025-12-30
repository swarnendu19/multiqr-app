import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}
import { stripe } from './src/lib/stripe';

async function testStripe() {
    try {
        console.log('Testing Stripe connection...');
        const customers = await stripe.customers.list({ limit: 1 });
        console.log('Stripe connection successful!');
        console.log('Found customer:', customers.data[0]?.id || 'No customers found (but connection works)');
    } catch (error: any) {
        console.error('Stripe connection failed:', error.message);
    }
}

testStripe();
