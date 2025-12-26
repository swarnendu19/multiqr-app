"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Sparkles, QrCode, BarChart3, Image as ImageIcon, Loader2 } from 'lucide-react';

// Stripe price ID for QR Pro monthly subscription
const QR_PRO_PRICE_ID = 'price_1ShMmG2MF7toLiOySRvLR70S';

const freePlanFeatures = [
    'Up to 5 QR codes',
    'Basic styling options',
    'PNG export only',
    'Standard support',
];

const proPlanFeatures = [
    'Unlimited QR codes',
    'All styling options',
    'PNG, JPEG & SVG export',
    'Center logo support',
    'Scan analytics',
    'Priority support',
];

export default function Pricing() {
    const router = useRouter();
    const { user, isProUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            router.push('/register');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user.id, // Using user-id header as per other API calls
                },
                body: JSON.stringify({ priceId: QR_PRO_PRICE_ID }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error('Failed to start checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user.id,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to open customer portal');
            }

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Portal error:', err);
            toast.error('Failed to open subscription management. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="flex h-14 items-center justify-between px-4 container mx-auto">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <QrCode className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">MultiQR</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Button variant="ghost" onClick={() => router.push('/manage')}>Dashboard</Button>
                        ) : (
                            <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
                        )}
                    </div>
                </div>
            </header>

            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6 text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            Simple Pricing
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Choose Your Plan
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Start free and upgrade when you need more power
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="rounded-2xl border border-border bg-card p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">Free</h3>
                                <p className="text-muted-foreground text-sm">Get started with basic features</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {freePlanFeatures.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push(user ? '/manage' : '/register')}
                            >
                                {user ? 'Go to Dashboard' : 'Get Started Free'}
                            </Button>
                        </div>

                        {/* Pro Plan */}
                        <div className="rounded-2xl border-2 border-primary bg-card p-8 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                Most Popular
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    Pro
                                    <Sparkles className="h-4 w-4 text-secondary" />
                                </h3>
                                <p className="text-muted-foreground text-sm">Everything you need to grow</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold">$9.99</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {proPlanFeatures.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {isProUser ? (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleManageSubscription}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Manage Subscription
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Upgrade to Pro
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Features Comparison */}
                    <div className="mt-20 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-8">Pro Features Highlight</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl bg-muted/30 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4">
                                    <QrCode className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">Unlimited QR Codes</h3>
                                <p className="text-sm text-muted-foreground">Create as many QR codes as you need</p>
                            </div>

                            <div className="p-6 rounded-xl bg-muted/30 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4">
                                    <ImageIcon className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">Center Logo</h3>
                                <p className="text-sm text-muted-foreground">Add your brand logo to QR codes</p>
                            </div>

                            <div className="p-6 rounded-xl bg-muted/30 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4">
                                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">Scan Analytics</h3>
                                <p className="text-sm text-muted-foreground">Track scans with detailed insights</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-primary" />
                        <span className="font-semibold">MultiQR</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} MultiQR. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
