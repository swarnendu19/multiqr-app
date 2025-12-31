"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
    const router = useRouter();
    const { signUp, user, loading: authLoading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

    useEffect(() => {
        if (user && !authLoading) {
            router.push('/qrcodes/new');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = registerSchema.safeParse({ fullName, email, password });
        if (!result.success) {
            const fieldErrors: { fullName?: string; email?: string; password?: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0] === 'fullName') fieldErrors.fullName = err.message;
                if (err.path[0] === 'email') fieldErrors.email = err.message;
                if (err.path[0] === 'password') fieldErrors.password = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        const { error } = await signUp(email, password, fullName);
        setLoading(false);

        if (error) {
            if (error.message.includes('already registered')) {
                toast.error('An account with this email already exists');
            } else {
                toast.error(error.message);
            }
        } else {
            toast.success('Account created successfully!');
            router.push('/qrcodes/new');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                            <QrCode className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold">MultiQR</span>
                    </Link>

                    <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                    <p className="text-muted-foreground mb-8">
                        Start creating beautiful QR codes for free
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={errors.fullName ? 'border-destructive' : ''}
                            />
                            {errors.fullName && (
                                <p className="text-sm text-destructive">{errors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-secondary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Panel - Decorative */}
            <div className="hidden lg:flex lg:flex-1 bg-gradient-hero items-center justify-center p-12">
                <div className="max-w-md text-primary-foreground">
                    <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
                        <QrCode className="h-16 w-16" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        Join thousands of creators
                    </h2>
                    <p className="text-primary-foreground/80 text-lg">
                        Start creating professional QR codes today. Free to get started,
                        no credit card required.
                    </p>
                </div>
            </div>
        </div>
    );
}
