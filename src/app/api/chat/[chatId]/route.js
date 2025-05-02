import { connectDB } from "@/lib/db";
import Chat from "@/models/Chat";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = params;
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await connectDB();
    
    // Find the chat by ID
    const chat = await Chat.findById(chatId)
      .populate({
        path: 'participants',
        select: 'name email image role isVendor'
      })
      .populate({
        path: 'messages.sender',
        select: 'name email image role isVendor'
      });
    
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify that the current user is a participant in this chat
    const userId = session.user.id;
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    // Mark messages as read for the current user
    await chat.markAsRead(userId);
    
    return NextResponse.json({ chat }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = params;
    const { content } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    await connectDB();
    
    // Find the chat by ID
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify that the current user is a participant in this chat
    const userId = session.user.id;
    if (!chat.participants.some(p => p.toString() === userId)) {
      return NextResponse.json({ error: "Unauthorized access to chat" }, { status: 403 });
    }

    // Add the message to the chat
    const message = await chat.addMessage(userId, content);
    
    // Populate the sender information for the new message
    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'messages.sender',
        select: 'name email image role isVendor'
      });
    
    const newMessage = populatedChat.messages.find(m => m._id.toString() === message._id.toString());
    
    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}