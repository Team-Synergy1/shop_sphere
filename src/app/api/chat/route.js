import { connectDB } from "@/lib/db";
import Chat from "@/models/Chat";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
	try {
		// Fixed: Added authOptions parameter to getServerSession
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Get current user ID
		const userId = session.user.id;

		// Find all chats where the current user is a participant
		const chats = await Chat.find({ participants: userId })
			.populate({
				path: "participants",
				select: "name email image role isVendor",
			})
			.populate({
				path: "messages.sender",
				select: "name email image role isVendor",
			})
			.sort({ lastActivity: -1 });

		return NextResponse.json({ chats }, { status: 200 });
	} catch (error) {
		console.error("Error fetching chats:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		// Fixed: Added authOptions parameter to getServerSession
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { participantId } = await request.json();
		if (!participantId) {
			return NextResponse.json(
				{ error: "Participant ID is required" },
				{ status: 400 }
			);
		}

		await connectDB();

		// Get current user ID
		const userId = session.user.id;

		// Sort participants to ensure consistent room IDs
		const participants = [userId, participantId].sort();

		// Check if chat already exists
		let chat = await Chat.findOne({
			participants: { $all: participants, $size: 2 },
		});

		// If chat doesn't exist, create a new one
		if (!chat) {
			chat = new Chat({
				participants: participants,
			});
			await chat.save();
		}

		return NextResponse.json(
			{
				chatId: chat._id,
				roomId: chat.getRoomId(),
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating chat:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
