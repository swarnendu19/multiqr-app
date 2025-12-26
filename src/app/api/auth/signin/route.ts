import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const prisma = getPrisma(); // ✅ runtime only

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.password !== password) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user,
            session: {
                access_token: user.id,
                user,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message ?? "Something went wrong" },
            { status: 400 }
        );
    }
}
