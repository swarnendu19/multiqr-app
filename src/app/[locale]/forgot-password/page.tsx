"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");

export default function ForgotPassword() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = emailSchema.safeParse(email);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        setLoading(true);
        const { error: resetError } = await resetPassword(email);
        setLoading(false);

        if (resetError) {
            toast.error(resetError.message);
        } else {
            setSent(true);
            toast.success("Reset link sent!");
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-8 w-8 text-secondary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                    <p className="text-muted-foreground mb-8">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md w-full">
                <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                        <QrCode className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-bold">MultiQR</span>
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Forgot password?</h1>
                    <p className="text-muted-foreground">
                        No worries, we&apos;ll send you reset instructions
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={error ? "border-destructive" : ""}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 mt-6 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}
