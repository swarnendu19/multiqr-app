import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const prisma = getPrisma();
        const projects = await prisma.qRProject.findMany({
            where: { user_id: userId },
            orderBy: { updated_at: 'desc' },
        });
        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const prisma = getPrisma();

        // Check subscription status and limits
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (user.subscription_status !== 'active') {
            const count = await prisma.qRProject.count({ where: { user_id: userId } });
            if (count >= 5) {
                return NextResponse.json(
                    { error: 'Free limit reached. Upgrade for unlimited QR codes.' },
                    { status: 403 }
                );
            }
        }

        const project = await prisma.qRProject.create({
            data: { ...body, user_id: userId },
        });
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
