"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useQRProjects } from '@/hooks/useQRProjects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Smartphone, Globe, Clock, MapPin } from 'lucide-react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
    const { user } = useAuth();
    const { projects } = useQRProjects();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState('all');
    const [timeRange, setTimeRange] = useState('30');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
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
    }, [user, selectedProject, timeRange]);

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
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground">
                            Track your QR code performance and user engagement
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Last 30 Days" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data?.overview.totalScans}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {data?.overview.growthRate > 0 ? '+' : ''}{data?.overview.growthRate}% from previous period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total QR codes created
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {data?.charts.countryData[0]?.country || 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Most active location
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Chart: Scans Over Time */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Scan Activity</CardTitle>
                        <CardDescription>Daily scan volume over time</CardDescription>
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
                            <CardTitle>Device Distribution</CardTitle>
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
                            <CardTitle>Hourly Traffic</CardTitle>
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
                            <CardTitle>Top Countries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data?.charts.countryData.map((item: any) => (
                                    <div key={item.country} className="flex items-center">
                                        <div className="w-full space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{item.country}</span>
                                                <span className="text-muted-foreground">{item.count} scans</span>
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
                                    <p className="text-center text-muted-foreground py-8">No location data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Browser Breakdown */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Browser Breakdown</CardTitle>
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
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest scans across all your projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Browser</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
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
                                            No recent scans found
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
