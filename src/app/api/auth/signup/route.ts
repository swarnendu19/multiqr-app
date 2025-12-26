import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, full_name } = await request.json();

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: { email, password, full_name },
        });
        return NextResponse.json({ user, session: { access_token: user.id, user } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
