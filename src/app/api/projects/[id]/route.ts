import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const project = await prisma.qRProject.findFirst({
            where: { id: params.id, user_id: userId },
        });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        console.log('PATCH /api/projects/[id] body keys:', Object.keys(body));
        if (body.thumbnail_url) {
            console.log('thumbnail_url length:', body.thumbnail_url.length);
        } else {
            console.log('thumbnail_url is missing or null');
        }

        const project = await prisma.qRProject.update({
            where: { id: params.id }, // In a real app, verify user_id ownership first or use updateMany
            data: body,
        });
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const userId = request.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await prisma.qRProject.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
