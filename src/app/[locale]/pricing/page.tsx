"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Sparkles, QrCode, BarChart3, Image as ImageIcon, Loader2 } from 'lucide-react';

// Stripe price ID for QR Pro monthly subscription
const QR_PRO_PRICE_ID = 'price_1ShMmG2MF7toLiOySRvLR70S';

const freePlanFeatures = (t: any) => [
    t('freeFeature1'),
    t('freeFeature2'),
    t('freeFeature3'),
    t('freeFeature4'),
];

const proPlanFeatures = (t: any) => [
    t('proFeature1'),
    t('proFeature2'),
    t('proFeature3'),
    t('proFeature4'),
    t('proFeature5'),
    t('proFeature6'),
];

export default function Pricing() {
    const router = useRouter();
    const { user, isProUser } = useAuth();
    const t = useTranslations('Pricing');
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
                            <Button variant="ghost" onClick={() => router.push('/manage')}>{t('dashboard')}</Button>
                        ) : (
                            <Button variant="ghost" onClick={() => router.push('/login')}>{t('login')}</Button>
                        )}
                    </div>
                </div>
            </header>

            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6 text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            {t('title')}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {t('subtitle')}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t('startFree')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="rounded-2xl border border-border bg-card p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">{t('free')}</h3>
                                <p className="text-muted-foreground text-sm">{t('freeDesc')}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {freePlanFeatures(t).map((feature) => (
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
                                {user ? t('goToDashboard') : t('getStartedFree')}
                            </Button>
                        </div>

                        {/* Pro Plan */}
                        <div className="rounded-2xl border-2 border-primary bg-card p-8 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                {t('mostPopular')}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    {t('pro')}
                                    <Sparkles className="h-4 w-4 text-secondary" />
                                </h3>
                                <p className="text-muted-foreground text-sm">{t('proDesc')}</p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold">$9.99</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {proPlanFeatures(t).map((feature) => (
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
                                    {t('manageSubscription')}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {t('upgradeToPro')}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Features Comparison */}
                    <div className="mt-20 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-8">{t('proFeaturesHighlight')}</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl bg-muted/30 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4">
                                    <QrCode className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">{t('unlimitedQr')}</h3>
                                <p className="text-sm text-muted-foreground">{t('unlimitedQrDesc')}</p>
                            </div>

                            <div className="p-6 rounded-xl bg-muted/30 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4">
                                    <ImageIcon className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">{t('centerLogo')}</h3>
                                <p className="text-sm text-muted-foreground">{t('centerLogoDesc')}</p>
                            </div>

                            <div className="p-6 rounded-xl bg-muted/30 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4">
                                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">{t('scanAnalytics')}</h3>
                                <p className="text-sm text-muted-foreground">{t('scanAnalyticsDesc')}</p>
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
                        © {new Date().getFullYear()} MultiQR. {t('allRightsReserved')}
                    </p>
                </div>
            </footer>
        </div>
    );
}
