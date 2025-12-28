import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { APP_URL } from '@/lib/config';

export async function GET(request: Request, { params }: { params: { code: string } }) {
    const code = params.code;
    const prisma = getPrisma();

    try {
        const project = await prisma.qRProject.findFirst({
            where: { short_code: code },
        });

        if (!project) {
            return NextResponse.redirect(`${APP_URL}/404`);
        }

        // Parse analytics data
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const referer = request.headers.get('referer') || 'Direct';
        const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
        const city = request.headers.get('x-vercel-ip-city') || 'Unknown';

        // Simple device/browser detection (can be improved with a library like ua-parser-js)
        let deviceType = 'Desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
        else if (/tablet/i.test(userAgent)) deviceType = 'Tablet';

        let browser = 'Unknown';
        if (/chrome/i.test(userAgent)) browser = 'Chrome';
        else if (/firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/safari/i.test(userAgent)) browser = 'Safari';
        else if (/edge/i.test(userAgent)) browser = 'Edge';

        // Log scan asynchronously (don't await to speed up redirect)
        // Note: In serverless, we should await, but for Vercel it's usually fine. 
        // To be safe, we await.
        await prisma.$transaction([
            prisma.qRScan.create({
                data: {
                    qr_project_id: project.id,
                    device_type: deviceType,
                    browser: browser,
                    country: country,
                    city: city,
                    user_agent: userAgent,
                    referrer: referer,
                },
            }),
            prisma.qRProject.update({
                where: { id: project.id },
                data: { scan_count: { increment: 1 } },
            }),
        ]);

        // Redirect logic
        if (project.qr_type === 'url') {
            const content = JSON.parse(project.content);
            let url = content.url;
            if (!url.startsWith('http')) {
                url = `https://${url}`;
            }
            return NextResponse.redirect(url);
        } else {
            // For other types, redirect to a view page
            return NextResponse.redirect(`${APP_URL}/view/${code}`);
        }

    } catch (error) {
        console.error('Scan error:', error);
        return NextResponse.redirect(`${APP_URL}/error`);
    }
}
