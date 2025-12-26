"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { QrCode, Sparkles, Palette, Download, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
    {
        icon: QrCode,
        title: 'Multiple QR Types',
        description: 'Create QR codes for URLs, WiFi, vCards, and plain text',
    },
    {
        icon: Palette,
        title: 'Custom Styling',
        description: 'Customize colors, patterns, and add your logo',
    },
    {
        icon: Download,
        title: 'High Quality Export',
        description: 'Export in PNG, JPEG, or SVG formats',
    },
    {
        icon: Sparkles,
        title: 'Live Preview',
        description: 'See changes instantly with our real-time editor',
    },
];

const benefits = [
    'Unlimited QR code generation',
    'Custom colors and styling',
    'Logo overlay support',
    'Multiple export formats',
    'Cloud storage for projects',
    'Works on any device',
];

export default function Index() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero opacity-5" />
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

                <div className="container relative py-24 md:py-32">
                    <div className="mx-auto max-w-3xl text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6 text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            Professional QR Code Generator
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Create Beautiful{' '}
                            <span className="gradient-text">QR Codes</span>
                            {' '}in Seconds
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Design stunning QR codes with custom colors, logos, and styles.
                            Perfect for business cards, marketing materials, and more.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                variant="hero"
                                size="lg"
                                className="h-12 px-8 text-lg"
                                onClick={() => router.push(user ? '/qrcodes/new' : '/register')}
                            >
                                Start Creating Free
                                <ArrowRight className="h-5 w-5 ml-1" />
                            </Button>

                            {!user && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-8 text-lg"
                                    onClick={() => router.push('/login')}
                                >
                                    Sign In
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 border-t border-border/50">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            A complete toolkit for creating professional QR codes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={feature.title}
                                className="group p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-soft transition-all duration-300 animate-slide-up"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Why Choose MultiQR?
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8">
                                Join thousands of businesses and creators who trust MultiQR
                                for their QR code needs.
                            </p>

                            <ul className="space-y-4">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex items-center justify-center">
                                <div className="w-full h-full rounded-2xl bg-card shadow-soft border border-border flex items-center justify-center">
                                    <QrCode className="h-32 w-32 text-primary/30" />
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Create Your QR Code?
                        </h2>
                        <p className="text-primary-foreground/80 text-lg mb-8">
                            Start for free. No credit card required.
                        </p>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="h-12 px-8 text-lg"
                            onClick={() => router.push(user ? '/qrcodes/new' : '/register')}
                        >
                            Get Started Now
                            <ArrowRight className="h-5 w-5 ml-1" />
                        </Button>
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
