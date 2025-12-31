"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
    const { user } = useAuth();
    const t = useTranslations('Account');
    const tCommon = useTranslations('Common');
    const [fullName, setFullName] = useState('');

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(t('profileUpdated'));
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('profile')}
                            </CardTitle>
                            <CardDescription>
                                {t('updateProfileDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">{t('name')}</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder={t('namePlaceholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('emailNote')}
                                    </p>
                                </div>
                                <Button type="submit">{tCommon('save')}</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Subscription Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                {t('subscription')}
                            </CardTitle>
                            <CardDescription>
                                {t('subscriptionDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{t('currentPlan')}</span>
                                        <Badge variant={user?.subscription_status === 'active' ? 'default' : 'secondary'}>
                                            {user?.subscription_status === 'active' ? t('pro') : t('free')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {user?.subscription_status === 'active'
                                            ? t('proPlanDesc')
                                            : t('freePlanDesc')}
                                    </p>
                                </div>
                                {user?.subscription_status === 'active' ? (
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('/api/create-portal-session', {
                                                    method: 'POST',
                                                    headers: { 'user-id': user.id },
                                                });
                                                const data = await res.json();
                                                if (data.url) window.location.href = data.url;
                                            } catch (error) {
                                                toast.error(t('portalError'));
                                            }
                                        }}
                                    >
                                        {t('manageSubscription')}
                                    </Button>
                                ) : (
                                    <Button onClick={() => window.location.href = '/pricing'}>
                                        {t('upgrade')}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                {t('security')}
                            </CardTitle>
                            <CardDescription>
                                {t('securityDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">{t('changePassword')}</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
