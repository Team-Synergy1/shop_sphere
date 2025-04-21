import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import {connectDB} from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        await connectDB();
        
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ points: user.rewardPoints || 0 });
    } catch (error) {
        console.error("Get user rewards error:", error);
        return NextResponse.json(
            { error: "Error fetching reward points" },
            { status: 500 }
        );
    }
}