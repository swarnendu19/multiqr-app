"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Moon, Sun, Laptop, Bell, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const t = useTranslations('Settings');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteAccount = () => {
        // Logic to delete account would go here
        toast.error(t('deleteDisabled'));
        setDeleteDialogOpen(false);
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
                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sun className="h-5 w-5" />
                                {t('appearance')}
                            </CardTitle>
                            <CardDescription>
                                {t('appearanceDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'light'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <Sun className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">{t('light')}</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <Moon className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">{t('dark')}</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'system'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <Laptop className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">{t('system')}</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                {t('notifications')}
                            </CardTitle>
                            <CardDescription>
                                {t('notificationsDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('emailNotifications')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('emailNotificationsDesc')}
                                    </p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('securityAlerts')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('securityAlertsDesc')}
                                    </p>
                                </div>
                                <Switch
                                    checked={securityAlerts}
                                    onCheckedChange={setSecurityAlerts}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('marketingEmails')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('marketingEmailsDesc')}
                                    </p>
                                </div>
                                <Switch
                                    checked={marketingEmails}
                                    onCheckedChange={setMarketingEmails}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                {t('dangerZone')}
                            </CardTitle>
                            <CardDescription>
                                {t('dangerZoneDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                <div>
                                    <h4 className="font-medium text-destructive">{t('deleteAccount')}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t('deleteAccountDesc')}
                                    </p>
                                </div>
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">{t('deleteAccount')}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
                                            <DialogDescription>
                                                {t('deleteConfirmDesc')}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                {t('cancel')}
                                            </Button>
                                            <Button variant="destructive" onClick={handleDeleteAccount}>
                                                {t('deleteAccount')}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
