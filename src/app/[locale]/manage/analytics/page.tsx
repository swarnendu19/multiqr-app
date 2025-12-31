"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useQRProjects } from '@/hooks/useQRProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Smartphone, Globe, Clock, MapPin, Lock, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { API_URL } from '@/lib/config';
import { UpgradeModal } from '@/components/ui/UpgradeModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
    const { user, isProUser } = useAuth();
    const { projects } = useQRProjects();
    const t = useTranslations('Analytics');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState('all');
    const [timeRange, setTimeRange] = useState('30');
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            // If not pro user, we don't fetch data, but we stop loading
            if (!isProUser) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const query = new URLSearchParams({
                    projectId: selectedProject,
                    days: timeRange
                });

                const res = await fetch(`${API_URL}/api/analytics?${query.toString()}`, {
                    headers: { 'user-id': user.id }
                });

                if (res.ok) {
                    const analyticsData = await res.json();
                    setData(analyticsData);
                }
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, selectedProject, timeRange, isProUser]);

    if (!isProUser) {
        return (
            <DashboardLayout>
                <div className="p-6 lg:p-8 h-full flex flex-col items-center justify-center min-h-[600px] text-center space-y-6">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h1 className="text-3xl font-bold">{t('lockedTitle')}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t('lockedDesc')}
                        </p>
                    </div>
                    <Button size="lg" onClick={() => setUpgradeModalOpen(true)} className="gap-2">
                        <Lock className="h-4 w-4" />
                        {t('unlock')}
                    </Button>

                    <UpgradeModal
                        open={upgradeModalOpen}
                        onOpenChange={setUpgradeModalOpen}
                        title={t('unlock')}
                        description={t('unlockDesc')}
                    />
                </div>
            </DashboardLayout>
        );
    }

    if (loading && !data) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full min-h-[500px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 space-y-8">
                {/* Header & Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-muted-foreground">
                            {t('subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('allProjects')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('allProjects')}</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder={t('last30Days')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">{t('last7Days')}</SelectItem>
                                <SelectItem value="30">{t('last30Days')}</SelectItem>
                                <SelectItem value="90">{t('last3Months')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('totalScans')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data?.overview.totalScans}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {data?.overview.growthRate > 0 ? '+' : ''}{data?.overview.growthRate}% {t('fromPrevious')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('activeProjects')}</CardTitle>
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('totalCreated')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('topCountry')}</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {data?.charts.countryData[0]?.country || 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('mostActive')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Chart: Scans Over Time */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('scanActivity')}</CardTitle>
                        <CardDescription>{t('scanActivityDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.charts.scansOverTime}>
                                    <defs>
                                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorScans)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary Charts Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Device Distribution */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>{t('deviceDistribution')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.charts.deviceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data?.charts.deviceData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hourly Distribution */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>{t('hourlyTraffic')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.charts.hourlyData}>
                                        <XAxis
                                            dataKey="hour"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        />
                                        <Bar dataKey="count" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Top Countries */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>{t('topCountries')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data?.charts.countryData.map((item: any) => (
                                    <div key={item.country} className="flex items-center">
                                        <div className="w-full space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{item.country}</span>
                                                <span className="text-muted-foreground">{item.count} {t('scans')}</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {data?.charts.countryData.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">{t('noLocationData')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Browser Breakdown */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>{t('browserBreakdown')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={data?.charts.browserData}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                        />
                                        <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('recentActivity')}</CardTitle>
                        <CardDescription>{t('recentActivityDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('project')}</TableHead>
                                    <TableHead>{t('device')}</TableHead>
                                    <TableHead>{t('browser')}</TableHead>
                                    <TableHead>{t('location')}</TableHead>
                                    <TableHead className="text-right">{t('time')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.recentActivity.map((scan: any) => (
                                    <TableRow key={scan.id}>
                                        <TableCell className="font-medium">{scan.project}</TableCell>
                                        <TableCell>{scan.device}</TableCell>
                                        <TableCell>{scan.browser}</TableCell>
                                        <TableCell>{scan.location}</TableCell>
                                        <TableCell className="text-right">
                                            {format(new Date(scan.time), 'MMM d, h:mm a')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data?.recentActivity.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {t('noRecentScans')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
