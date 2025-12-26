import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { startOfDay, subDays, format, parseISO, getHours } from 'date-fns';

export async function GET(request: Request) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const days = parseInt(searchParams.get('days') || '30');

    try {
        const prisma = getPrisma();
        const startDate = startOfDay(subDays(new Date(), days));

        // Build where clause
        const where: any = {
            project: {
                user_id: userId,
            },
            scanned_at: {
                gte: startDate,
            },
        };

        if (projectId && projectId !== 'all') {
            where.qr_project_id = projectId;
        }

        // Fetch scans
        const scans = await prisma.qRScan.findMany({
            where,
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                scanned_at: 'desc',
            },
        });

        // Calculate Overview Stats
        const totalScans = scans.length;

        // Growth calculation (mock logic for now, or simple comparison)
        // For real growth, we'd need previous period data. 
        // Let's just compare first half vs second half of the period for a simple trend
        const midPoint = startOfDay(subDays(new Date(), Math.floor(days / 2)));
        const recentScans = scans.filter(s => s.scanned_at >= midPoint).length;
        const previousScans = totalScans - recentScans;
        const growthRate = previousScans > 0 ? ((recentScans - previousScans) / previousScans) * 100 : 0;

        // Charts Data Aggregation

        // 1. Scans Over Time (Daily)
        const scansByDate = new Map<string, number>();
        // Initialize all days with 0
        for (let i = 0; i <= days; i++) {
            const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
            scansByDate.set(dateStr, 0);
        }

        scans.forEach(scan => {
            const dateStr = format(scan.scanned_at, 'yyyy-MM-dd');
            if (scansByDate.has(dateStr)) {
                scansByDate.set(dateStr, (scansByDate.get(dateStr) || 0) + 1);
            }
        });

        const scansOverTime = Array.from(scansByDate.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 2. Hourly Distribution
        const hourlyDist = new Array(24).fill(0);
        scans.forEach(scan => {
            const hour = getHours(scan.scanned_at);
            hourlyDist[hour]++;
        });
        const hourlyData = hourlyDist.map((count, hour) => ({
            hour: `${hour}:00`,
            count,
        }));

        // 3. Device Distribution
        const deviceCount: Record<string, number> = {};
        scans.forEach(scan => {
            const device = scan.device_type || 'Unknown';
            deviceCount[device] = (deviceCount[device] || 0) + 1;
        });
        const deviceData = Object.entries(deviceCount).map(([name, value]) => ({ name, value }));

        // 4. Browser Distribution
        const browserCount: Record<string, number> = {};
        scans.forEach(scan => {
            const browser = scan.browser || 'Unknown';
            browserCount[browser] = (browserCount[browser] || 0) + 1;
        });
        const browserData = Object.entries(browserCount).map(([name, value]) => ({ name, value }));

        // 5. Top Countries
        const countryCount: Record<string, number> = {};
        scans.forEach(scan => {
            const country = scan.country || 'Unknown';
            countryCount[country] = (countryCount[country] || 0) + 1;
        });
        const countryData = Object.entries(countryCount)
            .map(([country, count]) => ({ country, count, percentage: (count / totalScans) * 100 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 6. Recent Scans Table
        const recentActivity = scans.slice(0, 20).map(scan => ({
            id: scan.id,
            project: scan.project.name,
            device: scan.device_type || 'Unknown',
            browser: scan.browser || 'Unknown',
            location: [scan.city, scan.country].filter(Boolean).join(', ') || 'Unknown',
            time: scan.scanned_at,
        }));

        return NextResponse.json({
            overview: {
                totalScans,
                growthRate: Math.round(growthRate),
            },
            charts: {
                scansOverTime,
                hourlyData,
                deviceData,
                browserData,
                countryData,
            },
            recentActivity,
        });

    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
