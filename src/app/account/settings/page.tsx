"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
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
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteAccount = () => {
        // Logic to delete account would go here
        toast.error('Account deletion is disabled in this demo');
        setDeleteDialogOpen(false);
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your application preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sun className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize the look and feel of the application
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
                                    <span className="text-sm font-medium">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <Moon className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${theme === 'system'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                        }`}
                                >
                                    <Laptop className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">System</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Choose what you want to be notified about
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive emails about your account activity
                                    </p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Security Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified about suspicious login attempts
                                    </p>
                                </div>
                                <Switch
                                    checked={securityAlerts}
                                    onCheckedChange={setSecurityAlerts}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive news, updates, and special offers
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
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Irreversible actions for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                <div>
                                    <h4 className="font-medium text-destructive">Delete Account</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">Delete Account</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                account and remove your data from our servers.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" onClick={handleDeleteAccount}>
                                                Delete Account
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
