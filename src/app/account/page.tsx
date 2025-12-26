"use client";

import { useState } from 'react';
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
    const [fullName, setFullName] = useState('');

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Profile updated successfully');
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Email cannot be changed
                                    </p>
                                </div>
                                <Button type="submit">Save Changes</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Subscription Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Subscription
                            </CardTitle>
                            <CardDescription>
                                Manage your subscription and billing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">Current Plan</span>
                                        <Badge variant="secondary">Free</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Basic features with limited exports
                                    </p>
                                </div>
                                <Button variant="secondary">Upgrade</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security
                            </CardTitle>
                            <CardDescription>
                                Manage your password and security settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">Change Password</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
