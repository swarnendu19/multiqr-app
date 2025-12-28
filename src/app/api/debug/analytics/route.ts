import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const prisma = getPrisma();

    try {
        // 1. Get total scans
        const totalScansBefore = await prisma.qRScan.count();

        // 2. Get a test project (or create one if none)
        let project = await prisma.qRProject.findFirst({
            where: { short_code: { not: null } }
        });

        if (!project) {
            return NextResponse.json({ error: 'No projects with short_code found. Please create a new project first.' });
        }

        const scanCountBefore = project.scan_count;

        // 3. Simulate a scan (DB logic only)
        await prisma.$transaction([
            prisma.qRScan.create({
                data: {
                    qr_project_id: project.id,
                    device_type: 'Debug',
                    browser: 'Debug',
                    country: 'Debug',
                    city: 'Debug',
                    user_agent: 'Debug',
                    referrer: 'Debug',
                },
            }),
            prisma.qRProject.update({
                where: { id: project.id },
                data: { scan_count: { increment: 1 } },
            }),
        ]);

        // 4. Verify updates
        const totalScansAfter = await prisma.qRScan.count();
        const updatedProject = await prisma.qRProject.findUnique({ where: { id: project.id } });

        return NextResponse.json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                short_code: project.short_code,
            },
            before: {
                totalScans: totalScansBefore,
                projectScanCount: scanCountBefore,
            },
            after: {
                totalScans: totalScansAfter,
                projectScanCount: updatedProject?.scan_count,
            },
            working: totalScansAfter > totalScansBefore && (updatedProject?.scan_count || 0) > scanCountBefore
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
